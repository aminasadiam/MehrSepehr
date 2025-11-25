package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

type UserHandler struct {
	userRepo *repository.UserRepository
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		userRepo: repository.NewUserRepository(db),
	}
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

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user.ID = uint(id)
	if err := h.userRepo.Update(&user); err != nil {
		utils.ErrorResponse(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "User updated successfully", user, http.StatusOK)
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
