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

type PermissionHandler struct {
	permRepo *repository.PermissionRepository
}

func NewPermissionHandler(db *gorm.DB) *PermissionHandler {
	return &PermissionHandler{permRepo: repository.NewPermissionRepository(db)}
}

func (h *PermissionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Permission
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if p.Name == "" {
		utils.ErrorResponse(w, "Permission name required", http.StatusBadRequest)
		return
	}
	if err := h.permRepo.Create(&p); err != nil {
		utils.ErrorResponse(w, "Failed to create permission", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, p, http.StatusCreated)
}

func (h *PermissionHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	perms, err := h.permRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch permissions", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, perms, http.StatusOK)
}

func (h *PermissionHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	perm, err := h.permRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Permission not found", http.StatusNotFound)
		return
	}
	utils.JSONResponse(w, perm, http.StatusOK)
}

func (h *PermissionHandler) Update(w http.ResponseWriter, r *http.Request) {
	var p models.Permission
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if p.ID == 0 {
		utils.ErrorResponse(w, "Permission ID required", http.StatusBadRequest)
		return
	}
	if err := h.permRepo.Update(&p); err != nil {
		utils.ErrorResponse(w, "Failed to update permission", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, p, http.StatusOK)
}

func (h *PermissionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	if err := h.permRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete permission", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "Permission deleted", nil, http.StatusOK)
}
