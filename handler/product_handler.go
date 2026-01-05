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

// تابع کمکی برای گرفتن قیمت مناسب بر اساس گروه‌های کاربر
func (h *ProductHandler) getProductPrice(productID uint, userGroupIDs []uint) float64 {
	var price float64

	// اولویت: قیمت برای گروه‌های کاربر → قیمت پیش‌فرض (group_id NULL)
	query := h.db.Model(&models.ProductPrice{}).
		Where("product_id = ?", productID)

	if len(userGroupIDs) > 0 {
		query = query.Where("(group_id IN ? OR group_id IS NULL)", userGroupIDs)
	} else {
		query = query.Where("group_id IS NULL")
	}

	query.Order("group_id DESC NULLS LAST"). // گروه خاص اولویت دارد
							Limit(1).
							Pluck("price", &price)

	if price > 0 {
		return price
	}

	// fallback: هر قیمتی که موجود است
	h.db.Model(&models.ProductPrice{}).
		Where("product_id = ?", productID).
		Limit(1).
		Pluck("price", &price)

	return price
}

// تابع کمکی برای گرفتن گروه‌های کاربر
func (h *ProductHandler) getUserGroupIDs(r *http.Request) []uint {
	var groupIDs []uint
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		return groupIDs
	}

	var user models.User
	if err := h.db.Preload("Groups").First(&user, claims.UserID).Error; err != nil {
		return groupIDs
	}

	for _, g := range user.Groups {
		groupIDs = append(groupIDs, g.ID)
	}
	return groupIDs
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
			Stock int     `json:"stock"`
			Price float64 `json:"price,omitempty"`
		} `json:"sizes,omitempty"`
		Colors []struct {
			Name    string `json:"name"`
			HexCode string `json:"hex_code"`
			Stock   int    `json:"stock"`
		} `json:"colors,omitempty"`
		Prices []struct {
			GroupID *uint   `json:"group_id,omitempty"` // nil = default
			Price   float64 `json:"price"`
		} `json:"prices,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product := req.Product

	if err := h.productRepo.Create(&product); err != nil {
		utils.ErrorResponse(w, "Failed to create product", http.StatusInternalServerError)
		return
	}

	// اضافه کردن قیمت‌ها
	for _, p := range req.Prices {
		pp := models.ProductPrice{
			ProductID: product.ID,
			GroupID:   p.GroupID,
			Price:     p.Price,
		}
		h.db.Create(&pp)
	}

	// اضافه کردن تصاویر
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

	// اضافه کردن سایزها
	for _, size := range req.Sizes {
		productSize := models.ProductSize{
			ProductID: product.ID,
			Name:      size.Name,
			Stock:     size.Stock,
			Price:     size.Price,
		}
		h.db.Create(&productSize)
	}

	// اضافه کردن رنگ‌ها
	for _, color := range req.Colors {
		productColor := models.ProductColor{
			ProductID: product.ID,
			Name:      color.Name,
			HexCode:   color.HexCode,
			Stock:     color.Stock,
		}
		h.db.Create(&productColor)
	}

	utils.SuccessResponse(w, "Product created successfully", product, http.StatusCreated)
}

func (h *ProductHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	// خواندن پارامترهای فیلتری از query string
	filters := make(map[string]interface{})

	// دسته‌بندی
	if categoryID := r.URL.Query().Get("categoryId"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filters["categoryId"] = uint(id)
		}
	}

	// برند
	if brandID := r.URL.Query().Get("brandId"); brandID != "" {
		if id, err := strconv.ParseUint(brandID, 10, 32); err == nil {
			filters["brandId"] = uint(id)
		}
	}

	// جستجو
	if search := r.URL.Query().Get("search"); search != "" {
		filters["search"] = search
	}

	var products []models.Product
	if err := h.productRepo.GetAll(&products, filters); err != nil {
		utils.ErrorResponse(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}

	// Check if user is authenticated and get their roles/groups
	claims, isAuthenticated := utils.GetUserFromContext(r.Context())

	var isAdmin bool
	var groupIDs []uint

	if isAuthenticated {
		// Check if user is admin
		var user models.User
		if err := h.db.Preload("Roles").First(&user, claims.UserID).Error; err == nil {
			for _, role := range user.Roles {
				if role.Name == "admin" || role.Name == "administrator" {
					isAdmin = true
					break
				}
			}
		}

		// Get user's group IDs
		if !isAdmin {
			groupIDs = h.getUserGroupIDs(r)
		}
	}

	// Filter products based on authentication status
	var filteredProducts []models.Product

	if !isAuthenticated {
		// Unauthenticated users see all products but with price = 0
		filteredProducts = products
		for i := range filteredProducts {
			filteredProducts[i].Price = 0
		}
	} else if isAdmin {
		// Admins see all products
		filteredProducts = products
		for i := range filteredProducts {
			filteredProducts[i].Price = 0
		}
	} else {
		// Authenticated non-admin users see only products in their groups
		for _, product := range products {
			// Only show products that are in at least one of user's groups
			for _, productGroup := range product.Groups {
				for _, userGroupID := range groupIDs {
					if productGroup.ID == userGroupID {
						filteredProducts = append(filteredProducts, product)
						break
					}
				}
			}
		}
		// Set prices to 0 for all (removing price display from response)
		for i := range filteredProducts {
			filteredProducts[i].Price = 0
		}
	}

	utils.JSONResponse(w, filteredProducts, http.StatusOK)
}

func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var product models.Product
	if err := h.productRepo.GetByID(uint(id), &product); err != nil {
		utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
		return
	}

	// Preload روابط لازم
	h.db.Preload("Images").Preload("Sizes").Preload("Colors").Preload("Prices").Find(&product)

	// Check if user is authenticated
	_, isAuthenticated := utils.GetUserFromContext(r.Context())

	if isAuthenticated {
		groupIDs := h.getUserGroupIDs(r)
		product.Price = h.getProductPrice(product.ID, groupIDs)
	} else {
		product.Price = 0 // Hide price for unauthenticated users
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
			URL       string `json:"url"`
			Alt       string `json:"alt"`
			IsPrimary bool   `json:"is_primary"`
			Order     int    `json:"order"`
		} `json:"images,omitempty"`
		Sizes []struct {
			Name  string  `json:"name"`
			Stock int     `json:"stock"`
			Price float64 `json:"price,omitempty"`
		} `json:"sizes,omitempty"`
		Colors []struct {
			Name    string `json:"name"`
			HexCode string `json:"hex_code"`
			Stock   int    `json:"stock"`
		} `json:"colors,omitempty"`
		Prices []struct {
			GroupID *uint   `json:"group_id,omitempty"` // nil = default
			Price   float64 `json:"price"`
		} `json:"prices,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var product models.Product
	if err := h.productRepo.GetByID(uint(id), &product); err != nil {
		utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
		return
	}

	// به‌روزرسانی فیلدهای اصلی
	product.Name = req.Name
	product.Description = req.Description
	product.SKU = req.SKU
	product.Stock = req.Stock
	product.ModelNumber = req.ModelNumber
	product.Warranty = req.Warranty
	product.Weight = req.Weight
	product.Dimensions = req.Dimensions
	product.Power = req.Power
	product.Material = req.Material
	product.Capacity = req.Capacity
	product.Features = req.Features
	product.IsActive = req.IsActive
	product.CategoryID = req.CategoryID
	product.BrandID = req.BrandID

	if err := h.productRepo.Update(&product); err != nil {
		utils.ErrorResponse(w, "Failed to update product", http.StatusInternalServerError)
		return
	}

	// مدیریت روابط (برای سادگی، حذف قبلی و اضافه جدید - یا منطق بهتر)
	// برای مثال، برای prices:
	h.db.Where("product_id = ?", product.ID).Delete(&models.ProductPrice{})
	for _, p := range req.Prices {
		pp := models.ProductPrice{
			ProductID: product.ID,
			GroupID:   p.GroupID,
			Price:     p.Price,
		}
		h.db.Create(&pp)
	}

	// مشابه برای images, sizes, colors اگر لازم

	utils.SuccessResponse(w, "Product updated successfully", product, http.StatusOK)
}

// endpoint جدید: اضافه کردن قیمت به محصول
func (h *ProductHandler) AddPrice(w http.ResponseWriter, r *http.Request) {
	productIDStr := r.PathValue("id")
	productID, err := strconv.ParseUint(productIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var pp models.ProductPrice
	if err := json.NewDecoder(r.Body).Decode(&pp); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	pp.ProductID = uint(productID)
	if pp.Price <= 0 {
		utils.ErrorResponse(w, "Price must be greater than 0", http.StatusBadRequest)
		return
	}

	if err := h.db.Create(&pp).Error; err != nil {
		utils.ErrorResponse(w, "Failed to add price", http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, pp, http.StatusCreated)
}

func (h *ProductHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid product id", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.ErrorResponse(w, "Invalid multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		utils.ErrorResponse(w, "image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	uploadDir := "./uploads/products"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.ErrorResponse(w, "Failed to create upload dir", http.StatusInternalServerError)
		return
	}

	ext := filepath.Ext(header.Filename)
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

	imageURL := "https://mehrsepehr.com/api/assets/products/" + filename
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

	utils.SuccessResponse(w, "Image uploaded successfully", productImage, http.StatusCreated)
}

func (h *ProductHandler) DeleteImage(w http.ResponseWriter, r *http.Request) {
	imageIDStr := r.PathValue("imageId")
	imageID, err := strconv.ParseUint(imageIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid image ID", http.StatusBadRequest)
		return
	}

	// Get the image record
	var productImage models.ProductImage
	if err := h.db.First(&productImage, imageID).Error; err != nil {
		utils.ErrorResponse(w, "Image not found", http.StatusNotFound)
		return
	}

	// Extract filename from URL
	url := productImage.URL
	parts := strings.Split(url, "/")
	if len(parts) == 0 {
		utils.ErrorResponse(w, "Invalid image URL", http.StatusBadRequest)
		return
	}
	filename := parts[len(parts)-1]

	// Delete the file from disk
	filePath := filepath.Join("./uploads/products", filename)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		// Log the error but continue with DB deletion
		fmt.Printf("Warning: Failed to delete image file %s: %v\n", filePath, err)
	}

	// Delete from database
	if err := h.db.Delete(&productImage).Error; err != nil {
		utils.ErrorResponse(w, "Failed to delete image record", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Image deleted successfully", nil, http.StatusOK)
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
