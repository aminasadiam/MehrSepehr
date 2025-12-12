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

type BrandHandler struct {
	brandRepo *repository.BrandRepository
}

func NewBrandHandler(db *gorm.DB) *BrandHandler {
	return &BrandHandler{
		brandRepo: repository.NewBrandRepository(db),
	}
}

func (h *BrandHandler) Create(w http.ResponseWriter, r *http.Request) {
	var brand models.Brand
	if err := json.NewDecoder(r.Body).Decode(&brand); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if brand.Name == "" {
		utils.ErrorResponse(w, "Brand name is required", http.StatusBadRequest)
		return
	}

	if err := h.brandRepo.Create(&brand); err != nil {
		utils.ErrorResponse(w, "Failed to create brand", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Brand created successfully", brand, http.StatusCreated)
}

func (h *BrandHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	brands, err := h.brandRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch brands", http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, brands, http.StatusOK)
}

func (h *BrandHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid brand ID", http.StatusBadRequest)
		return
	}

	brand, err := h.brandRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Brand not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, brand, http.StatusOK)
}

func (h *BrandHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid brand ID", http.StatusBadRequest)
		return
	}

	var brand models.Brand
	if err := json.NewDecoder(r.Body).Decode(&brand); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	brand.ID = uint(id)
	if err := h.brandRepo.Update(&brand); err != nil {
		utils.ErrorResponse(w, "Failed to update brand", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Brand updated successfully", brand, http.StatusOK)
}

func (h *BrandHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid brand ID", http.StatusBadRequest)
		return
	}

	if err := h.brandRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete brand", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Brand deleted successfully", nil, http.StatusOK)
}

