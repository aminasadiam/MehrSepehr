package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

type ProductHandler struct {
	productRepo *repository.ProductRepository
	db          *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{
		productRepo: repository.NewProductRepository(db),
		db:          db,
	}
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		models.Product
		Images []struct {
			URL       string `json:"url"`
			Alt       string `json:"alt"`
			IsPrimary bool   `json:"is_primary"`
			Order     int    `json:"order"`
		} `json:"images,omitempty"`
		Sizes []struct {
			Name  string  `json:"name"`
			Stock  int     `json:"stock"`
			Price  float64 `json:"price,omitempty"`
		} `json:"sizes,omitempty"`
		Colors []struct {
			Name    string `json:"name"`
			HexCode string `json:"hex_code"`
			Stock   int    `json:"stock"`
		} `json:"colors,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product := req.Product

	// Create product first
	if err := h.productRepo.Create(&product); err != nil {
		utils.ErrorResponse(w, "Failed to create product", http.StatusInternalServerError)
		return
	}

	// Add images
	for _, img := range req.Images {
		productImage := models.ProductImage{
			ProductID: product.ID,
			URL:       img.URL,
			Alt:       img.Alt,
			IsPrimary: img.IsPrimary,
			Order:     img.Order,
		}
		h.db.Create(&productImage)
	}

	// Add sizes
	for _, size := range req.Sizes {
		productSize := models.ProductSize{
			ProductID: product.ID,
			Name:      size.Name,
			Stock:     size.Stock,
			Price:     size.Price,
		}
		h.db.Create(&productSize)
	}

	// Add colors
	for _, color := range req.Colors {
		productColor := models.ProductColor{
			ProductID: product.ID,
			Name:      color.Name,
			HexCode:   color.HexCode,
			Stock:     color.Stock,
		}
		h.db.Create(&productColor)
	}

	// Reload product with relations
	updatedProduct, _ := h.productRepo.GetByID(product.ID)

	utils.SuccessResponse(w, "Product created successfully", updatedProduct, http.StatusCreated)
}

func (h *ProductHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	categoryParam := r.URL.Query().Get("category_id")
	brandParam := r.URL.Query().Get("brand_id")
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))

	var categoryID *uint
	if categoryParam != "" {
		if id, err := strconv.ParseUint(categoryParam, 10, 32); err == nil {
			cid := uint(id)
			categoryID = &cid
		}
	}

	var brandID *uint
	if brandParam != "" {
		if id, err := strconv.ParseUint(brandParam, 10, 32); err == nil {
			bid := uint(id)
			brandID = &bid
		}
	}

	var products []models.Product
	var err error

	// Use search when filters or query are provided; otherwise fetch all
	if q != "" || categoryID != nil || brandID != nil {
		products, err = h.productRepo.Search(q, categoryID, brandID)
	} else {
		products, err = h.productRepo.GetAll()
	}
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}

	// If user context exists, filter by group membership. Otherwise return empty (shouldn't happen because route requires auth)
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Admins can see all products
	userRepo := repository.NewUserRepository(h.db)
	user, err := userRepo.GetByID(claims.UserID)
	if err == nil {
		for _, role := range user.Roles {
			if role.Name == "admin" || role.Name == "administrator" {
				utils.JSONResponse(w, products, http.StatusOK)
				return
			}
		}
	}

	// Build a set of group IDs the user belongs to
	userGroupIDs := map[uint]bool{}
	if user != nil {
		for _, g := range user.Groups {
			userGroupIDs[g.ID] = true
		}
	}

	// Filter products: include if product has no groups OR intersects user groups
	var visible []models.Product
	for _, p := range products {
		if len(p.Groups) == 0 {
			visible = append(visible, p)
			continue
		}
		for _, g := range p.Groups {
			if userGroupIDs[g.ID] {
				visible = append(visible, p)
				break
			}
		}
	}

	utils.JSONResponse(w, visible, http.StatusOK)
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

	var req struct {
		models.Product
		Images []struct {
			ID        uint   `json:"id,omitempty"`
			URL       string `json:"url"`
			Alt       string `json:"alt"`
			IsPrimary bool   `json:"is_primary"`
			Order     int    `json:"order"`
		} `json:"images,omitempty"`
		Sizes []struct {
			ID    uint    `json:"id,omitempty"`
			Name  string  `json:"name"`
			Stock int     `json:"stock"`
			Price float64 `json:"price,omitempty"`
		} `json:"sizes,omitempty"`
		Colors []struct {
			ID      uint   `json:"id,omitempty"`
			Name    string `json:"name"`
			HexCode string `json:"hex_code"`
			Stock   int    `json:"stock"`
		} `json:"colors,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product := req.Product
	product.ID = uint(id)

	// Update product
	if err := h.productRepo.Update(&product); err != nil {
		utils.ErrorResponse(w, "Failed to update product", http.StatusInternalServerError)
		return
	}

	// Delete existing images, sizes, colors
	h.db.Where("product_id = ?", product.ID).Delete(&models.ProductImage{})
	h.db.Where("product_id = ?", product.ID).Delete(&models.ProductSize{})
	h.db.Where("product_id = ?", product.ID).Delete(&models.ProductColor{})

	// Add new images
	for _, img := range req.Images {
		productImage := models.ProductImage{
			ProductID: product.ID,
			URL:       img.URL,
			Alt:       img.Alt,
			IsPrimary: img.IsPrimary,
			Order:     img.Order,
		}
		h.db.Create(&productImage)
	}

	// Add new sizes
	for _, size := range req.Sizes {
		productSize := models.ProductSize{
			ProductID: product.ID,
			Name:      size.Name,
			Stock:     size.Stock,
			Price:     size.Price,
		}
		h.db.Create(&productSize)
	}

	// Add new colors
	for _, color := range req.Colors {
		productColor := models.ProductColor{
			ProductID: product.ID,
			Name:      color.Name,
			HexCode:   color.HexCode,
			Stock:     color.Stock,
		}
		h.db.Create(&productColor)
	}

	// Reload product with relations
	updatedProduct, _ := h.productRepo.GetByID(product.ID)

	utils.SuccessResponse(w, "Product updated successfully", updatedProduct, http.StatusOK)
}

// UploadProductImage handles image upload for products
func (h *ProductHandler) UploadProductImage(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	// Verify product exists
	_, err = h.productRepo.GetByID(uint(productID))
	if err != nil {
		utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB max
		utils.ErrorResponse(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		utils.ErrorResponse(w, "image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create uploads dir if not exists
	uploadDir := "./uploads/products"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.ErrorResponse(w, "Failed to create upload dir", http.StatusInternalServerError)
		return
	}

	ext := filepath.Ext(header.Filename)
	// Use nanosecond timestamp to avoid collisions when multiple images upload in the same second
	filename := fmt.Sprintf("product_%d_%d%s", productID, time.Now().UnixNano(), ext)
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

	// Create product image record
	imageURL := "/uploads/products/" + filename
	isPrimary := r.FormValue("is_primary") == "true"
	order, _ := strconv.Atoi(r.FormValue("order"))

	productImage := models.ProductImage{
		ProductID: uint(productID),
		URL:       imageURL,
		Alt:       r.FormValue("alt"),
		IsPrimary: isPrimary,
		Order:     order,
	}

	if err := h.db.Create(&productImage).Error; err != nil {
		utils.ErrorResponse(w, "Failed to save image record", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Image uploaded successfully", productImage, http.StatusOK)
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
