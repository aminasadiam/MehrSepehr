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

type OrderHandler struct {
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
	walletRepo  *repository.WalletRepository
	db          *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{
		orderRepo:   repository.NewOrderRepository(db),
		productRepo: repository.NewProductRepository(db),
		walletRepo:  repository.NewWalletRepository(db),
		db:          db,
	}
}

// تابع کمکی برای گرفتن قیمت مناسب بر اساس گروه‌های کاربر (کپی از ProductHandler)
func (h *OrderHandler) getProductPrice(productID uint, userGroupIDs []uint) float64 {
	var price float64

	// اولویت: قیمت برای گروه‌های کاربر → قیمت پیش‌فرض (group_id NULL)
	query := h.db.Model(&models.ProductPrice{}).
		Where("product_id = ?", productID)

	if len(userGroupIDs) > 0 {
		query = query.Where("(group_id IN ? OR group_id IS NULL)", userGroupIDs)
	} else {
		query = query.Where("group_id IS NULL")
	}

	query.Order("group_id DESC NULLS LAST").
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

// تابع کمکی برای گرفتن گروه‌های کاربر (کپی از ProductHandler)
func (h *OrderHandler) getUserGroupIDs(r *http.Request) []uint {
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

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	order.UserID = claims.UserID
	order.Status = "pending"
	order.Total = 0

	groupIDs := h.getUserGroupIDs(r)

	// Calculate total from order details
	for i := range order.Details {
		var product models.Product
		err := h.productRepo.GetByID(order.Details[i].ProductID, &product)
		if err != nil {
			utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
			return
		}

		price := h.getProductPrice(product.ID, groupIDs)
		if price == 0 {
			utils.ErrorResponse(w, "No price found for product", http.StatusBadRequest)
			return
		}

		order.Details[i].UnitPrice = price
		order.Details[i].Subtotal = price * float64(order.Details[i].Quantity)
		order.Total += order.Details[i].Subtotal

		// Check stock
		if product.Stock < order.Details[i].Quantity {
			utils.ErrorResponse(w, "Insufficient stock", http.StatusBadRequest)
			return
		}
	}

	// Check wallet balance
	wallet, err := h.walletRepo.GetByUserID(claims.UserID)
	if err != nil {
		utils.ErrorResponse(w, "Wallet not found", http.StatusNotFound)
		return
	}

	if wallet.Balance < order.Total {
		utils.ErrorResponse(w, "Insufficient balance", http.StatusBadRequest)
		return
	}

	// Process payment: deduct from wallet
	if err := h.walletRepo.AddBalance(claims.UserID, -order.Total); err != nil {
		utils.ErrorResponse(w, "Failed to process payment", http.StatusInternalServerError)
		return
	}

	// Update stock
	for i := range order.Details {
		var product models.Product
		h.productRepo.GetByID(order.Details[i].ProductID, &product)
		product.Stock -= order.Details[i].Quantity
		h.productRepo.Update(&product)
	}

	order.Status = "paid"
	if err := h.orderRepo.Create(&order); err != nil {
		utils.ErrorResponse(w, "Failed to create order", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Order created successfully", order, http.StatusCreated)
}

func (h *OrderHandler) GetAllForUser(w http.ResponseWriter, r *http.Request) {
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	orders, err := h.orderRepo.GetByUserID(claims.UserID)
	if err != nil {
		utils.ErrorResponse(w, "Failed to fetch orders", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, orders, http.StatusOK)
}

func (h *OrderHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	order, err := h.orderRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Order not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, order, http.StatusOK)
}

func (h *OrderHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	order.ID = uint(id)
	if err := h.orderRepo.Update(&order); err != nil {
		utils.ErrorResponse(w, "Failed to update order", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Order updated successfully", order, http.StatusOK)
}

func (h *OrderHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	if err := h.orderRepo.Delete(uint(id)); err != nil {
		utils.ErrorResponse(w, "Failed to delete order", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Order deleted successfully", nil, http.StatusOK)
}
