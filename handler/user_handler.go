package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

type UserHandler struct {
	userRepo *repository.UserRepository
}

// UploadAvatar allows a user to upload their own avatar image.
// Expects multipart/form-data with field "avatar".
func (h *UserHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Ensure the authenticated user matches the target user
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok || claims.UserID != uint(id) {
		utils.ErrorResponse(w, "Unauthorized to upload avatar for this user", http.StatusUnauthorized)
		return
	}

	// Parse form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.ErrorResponse(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		utils.ErrorResponse(w, "avatar file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create uploads dir if not exists
	uploadDir := "./uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.ErrorResponse(w, "Failed to create upload dir", http.StatusInternalServerError)
		return
	}

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("avatar_%d_%d%s", id, time.Now().Unix(), ext)
	outPath := filepath.Join(uploadDir, filename)

	outFile, err := os.Create(outPath)
	if err != nil {
		utils.ErrorResponse(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, file); err != nil {
		utils.ErrorResponse(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Update user record with avatar path
	existing, err := h.userRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}
	// Use HTTPS through nginx proxy
	existing.Avatar = "https://mehrsepehr.com/api/assets/avatar/" + filename
	if err := h.userRepo.Update(existing); err != nil {
		utils.ErrorResponse(w, "Failed to update user avatar", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Avatar uploaded", map[string]string{"avatar": existing.Avatar}, http.StatusOK)
}

// AdminUploadAvatar allows an admin to upload avatar for any user.
func (h *UserHandler) AdminUploadAvatar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.ErrorResponse(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		utils.ErrorResponse(w, "avatar file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	uploadDir := "./uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.ErrorResponse(w, "Failed to create upload dir", http.StatusInternalServerError)
		return
	}

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("avatar_%d_%d%s", id, time.Now().Unix(), ext)
	outPath := filepath.Join(uploadDir, filename)

	outFile, err := os.Create(outPath)
	if err != nil {
		utils.ErrorResponse(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, file); err != nil {
		utils.ErrorResponse(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	existing, err := h.userRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}
	// Use HTTPS through nginx proxy
	existing.Avatar = "https://mehrsepehr.com/api/assets/avatar/" + filename
	if err := h.userRepo.Update(existing); err != nil {
		utils.ErrorResponse(w, "Failed to update user avatar", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Avatar uploaded", map[string]string{"avatar": existing.Avatar}, http.StatusOK)
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		userRepo: repository.NewUserRepository(db),
	}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
		RoleIDs  []uint `json:"role_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if body.Username == "" || body.Email == "" || body.Password == "" {
		utils.ErrorResponse(w, "username, email and password are required", http.StatusBadRequest)
		return
	}

	// Check uniqueness
	if _, err := h.userRepo.GetByEmail(body.Email); err == nil {
		utils.ErrorResponse(w, "email already in use", http.StatusBadRequest)
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		utils.ErrorResponse(w, "Failed to check email uniqueness", http.StatusInternalServerError)
		return
	}
	if _, err := h.userRepo.GetByUsername(body.Username); err == nil {
		utils.ErrorResponse(w, "username already in use", http.StatusBadRequest)
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		utils.ErrorResponse(w, "Failed to check username uniqueness", http.StatusInternalServerError)
		return
	}

	hashed, err := utils.HashPassword(body.Password)
	if err != nil {
		utils.ErrorResponse(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	user := &models.User{
		Username: body.Username,
		Email:    body.Email,
		Password: hashed,
		Phone:    body.Phone,
	}

	if err := h.userRepo.Create(user); err != nil {
		utils.ErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Attach roles if any
	for _, rid := range body.RoleIDs {
		_ = h.userRepo.AddRole(user.ID, rid)
	}

	utils.JSONResponse(w, user, http.StatusCreated)
}

func (h *UserHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, users, http.StatusOK)
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, user, http.StatusOK)
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode into a partial body so we don't accidentally overwrite fields
	// (like Password) when they are not provided in the request.
	var body struct {
		Username *string `json:"username"`
		Email    *string `json:"email"`
		Password *string `json:"password"`
		Phone    *string `json:"phone"`
		Avatar   *string `json:"avatar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Load existing user
	existing, err := h.userRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	// Update only provided fields
	if body.Username != nil {
		existing.Username = *body.Username
	}
	if body.Email != nil {
		existing.Email = *body.Email
	}
	if body.Phone != nil {
		existing.Phone = *body.Phone
	}
	if body.Avatar != nil {
		existing.Avatar = *body.Avatar
	}
	if body.Password != nil && *body.Password != "" {
		hashed, err := utils.HashPassword(*body.Password)
		if err != nil {
			utils.ErrorResponse(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}
		existing.Password = hashed
	}

	if err := h.userRepo.Update(existing); err != nil {
		utils.ErrorResponse(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "User updated successfully", existing, http.StatusOK)
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if err := h.userRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "User deleted successfully", nil, http.StatusOK)
}

// AddRole attaches a role to a user. Expects JSON { "role_id": <id> }
func (h *UserHandler) AddRole(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var body struct {
		RoleID uint `json:"role_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if body.RoleID == 0 {
		utils.ErrorResponse(w, "role_id is required", http.StatusBadRequest)
		return
	}

	if err := h.userRepo.AddRole(uint(id), body.RoleID); err != nil {
		utils.ErrorResponse(w, "Failed to add role to user", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Role added to user", nil, http.StatusOK)
}

// RemoveRole detaches a role from a user. Route: DELETE /api/admin/users/{id}/roles/{roleId}
func (h *UserHandler) RemoveRole(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	roleID, err := strconv.ParseUint(r.PathValue("roleId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid role ID", http.StatusBadRequest)
		return
	}

	if err := h.userRepo.RemoveRole(uint(id), uint(roleID)); err != nil {
		utils.ErrorResponse(w, "Failed to remove role from user", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Role removed from user", nil, http.StatusOK)
}
