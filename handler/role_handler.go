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

type RoleHandler struct {
	roleRepo *repository.RoleRepository
}

func NewRoleHandler(db *gorm.DB) *RoleHandler {
	return &RoleHandler{roleRepo: repository.NewRoleRepository(db)}
}

func (h *RoleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var role models.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if role.Name == "" {
		utils.ErrorResponse(w, "Role name required", http.StatusBadRequest)
		return
	}
	if err := h.roleRepo.Create(&role); err != nil {
		utils.ErrorResponse(w, "Failed to create role", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, role, http.StatusCreated)
}

func (h *RoleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	roles, err := h.roleRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch roles", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, roles, http.StatusOK)
}

func (h *RoleHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	role, err := h.roleRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Role not found", http.StatusNotFound)
		return
	}
	utils.JSONResponse(w, role, http.StatusOK)
}

func (h *RoleHandler) Update(w http.ResponseWriter, r *http.Request) {
	var role models.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if role.ID == 0 {
		utils.ErrorResponse(w, "Role ID required", http.StatusBadRequest)
		return
	}
	if err := h.roleRepo.Update(&role); err != nil {
		utils.ErrorResponse(w, "Failed to update role", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, role, http.StatusOK)
}

func (h *RoleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	if err := h.roleRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete role", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "Role deleted", nil, http.StatusOK)
}

// AddPermission attaches a permission to a role. Expects JSON { "permission_id": <id> }
func (h *RoleHandler) AddPermission(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	roleID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid role id", http.StatusBadRequest)
		return
	}

	var body struct {
		PermissionID uint `json:"permission_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if body.PermissionID == 0 {
		utils.ErrorResponse(w, "permission_id required", http.StatusBadRequest)
		return
	}

	if err := h.roleRepo.AddPermission(uint(roleID), body.PermissionID); err != nil {
		utils.ErrorResponse(w, "Failed to add permission to role", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Permission added to role", nil, http.StatusOK)
}

// RemovePermission detaches a permission from a role. Route includes both ids.
func (h *RoleHandler) RemovePermission(w http.ResponseWriter, r *http.Request) {
	roleIDStr := r.PathValue("id")
	permIDStr := r.PathValue("permId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid role id", http.StatusBadRequest)
		return
	}
	permID, err := strconv.ParseUint(permIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid permission id", http.StatusBadRequest)
		return
	}

	if err := h.roleRepo.RemovePermission(uint(roleID), uint(permID)); err != nil {
		utils.ErrorResponse(w, "Failed to remove permission from role", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Permission removed from role", nil, http.StatusOK)
}
