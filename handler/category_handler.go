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

type CategoryHandler struct {
	categoryRepo *repository.CategoryRepository
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{
		categoryRepo: repository.NewCategoryRepository(db),
	}
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var category models.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.categoryRepo.Create(&category); err != nil {
		utils.ErrorResponse(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Category created successfully", category, http.StatusCreated)
}

func (h *CategoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	categories, err := h.categoryRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch categories", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, categories, http.StatusOK)
}

func (h *CategoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	category, err := h.categoryRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Category not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, category, http.StatusOK)
}

func (h *CategoryHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	category, err := h.categoryRepo.GetBySlug(slug)
	if err != nil {
		utils.ErrorResponse(w, "Category not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, category, http.StatusOK)
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	var category models.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	category.ID = uint(id)
	if err := h.categoryRepo.Update(&category); err != nil {
		utils.ErrorResponse(w, "Failed to update category", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Category updated successfully", category, http.StatusOK)
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	if err := h.categoryRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Category deleted successfully", nil, http.StatusOK)
}

