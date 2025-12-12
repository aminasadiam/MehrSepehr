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

type GroupHandler struct {
	repo *repository.GroupRepository
}

func NewGroupHandler(db *gorm.DB) *GroupHandler {
	return &GroupHandler{repo: repository.NewGroupRepository(db)}
}

func (h *GroupHandler) Create(w http.ResponseWriter, r *http.Request) {
	var g models.Group
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if g.Name == "" {
		utils.ErrorResponse(w, "Group name required", http.StatusBadRequest)
		return
	}
	if err := h.repo.Create(&g); err != nil {
		utils.ErrorResponse(w, "Failed to create group", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, g, http.StatusCreated)
}

func (h *GroupHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	groups, err := h.repo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch groups", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, groups, http.StatusOK)
}

func (h *GroupHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	g, err := h.repo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Group not found", http.StatusNotFound)
		return
	}
	utils.JSONResponse(w, g, http.StatusOK)
}

func (h *GroupHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid id", http.StatusBadRequest)
		return
	}
	if err := h.repo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete group", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "Group deleted", nil, http.StatusOK)
}

// Attach product to group
func (h *GroupHandler) AddProduct(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	groupID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid group id", http.StatusBadRequest)
		return
	}
	var body struct {
		ProductID uint `json:"product_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if body.ProductID == 0 {
		utils.ErrorResponse(w, "product_id required", http.StatusBadRequest)
		return
	}
	if err := h.repo.AddProduct(uint(groupID), body.ProductID); err != nil {
		utils.ErrorResponse(w, "Failed to add product to group", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "Product added to group", nil, http.StatusOK)
}

func (h *GroupHandler) RemoveProduct(w http.ResponseWriter, r *http.Request) {
	gidStr := r.PathValue("id")
	pidStr := r.PathValue("prodId")
	gid, err := strconv.ParseUint(gidStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid group id", http.StatusBadRequest)
		return
	}
	pid, err := strconv.ParseUint(pidStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product id", http.StatusBadRequest)
		return
	}
	if err := h.repo.RemoveProduct(uint(gid), uint(pid)); err != nil {
		utils.ErrorResponse(w, "Failed to remove product from group", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "Product removed from group", nil, http.StatusOK)
}

// Attach user to group
func (h *GroupHandler) AddUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	groupID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid group id", http.StatusBadRequest)
		return
	}
	var body struct {
		UserID uint `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if body.UserID == 0 {
		utils.ErrorResponse(w, "user_id required", http.StatusBadRequest)
		return
	}
	if err := h.repo.AddUser(uint(groupID), body.UserID); err != nil {
		utils.ErrorResponse(w, "Failed to add user to group", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "User added to group", nil, http.StatusOK)
}

func (h *GroupHandler) RemoveUser(w http.ResponseWriter, r *http.Request) {
	gidStr := r.PathValue("id")
	uidStr := r.PathValue("userId")
	gid, err := strconv.ParseUint(gidStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid group id", http.StatusBadRequest)
		return
	}
	uid, err := strconv.ParseUint(uidStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	if err := h.repo.RemoveUser(uint(gid), uint(uid)); err != nil {
		utils.ErrorResponse(w, "Failed to remove user from group", http.StatusInternalServerError)
		return
	}
	utils.SuccessResponse(w, "User removed from group", nil, http.StatusOK)
}
