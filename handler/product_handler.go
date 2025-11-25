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

type ProductHandler struct {
	productRepo *repository.ProductRepository
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{
		productRepo: repository.NewProductRepository(db),
	}
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.productRepo.Create(&product); err != nil {
		utils.ErrorResponse(w, "Failed to create product", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Product created successfully", product, http.StatusCreated)
}

func (h *ProductHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	categoryID := r.URL.Query().Get("category_id")
	if categoryID != "" {
		id, err := strconv.ParseUint(categoryID, 10, 32)
		if err == nil {
			products, err := h.productRepo.GetByCategory(uint(id))
			if err != nil {
				utils.ErrorResponse(w, "Failed to fetch products", http.StatusInternalServerError)
				return
			}
			utils.JSONResponse(w, products, http.StatusOK)
			return
		}
	}

	products, err := h.productRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, products, http.StatusOK)
}

func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	product, err := h.productRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, product, http.StatusOK)
}

func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product.ID = uint(id)
	if err := h.productRepo.Update(&product); err != nil {
		utils.ErrorResponse(w, "Failed to update product", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Product updated successfully", product, http.StatusOK)
}

func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	if err := h.productRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete product", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Product deleted successfully", nil, http.StatusOK)
}

