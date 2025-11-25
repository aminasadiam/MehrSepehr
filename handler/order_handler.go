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
	orderRepo  *repository.OrderRepository
	productRepo *repository.ProductRepository
	walletRepo *repository.WalletRepository
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{
		orderRepo:  repository.NewOrderRepository(db),
		productRepo: repository.NewProductRepository(db),
		walletRepo: repository.NewWalletRepository(db),
	}
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

	// Calculate total from order details
	for i := range order.Details {
		product, err := h.productRepo.GetByID(order.Details[i].ProductID)
		if err != nil {
			utils.ErrorResponse(w, "Product not found", http.StatusNotFound)
			return
		}

		order.Details[i].UnitPrice = product.Price
		order.Details[i].Subtotal = product.Price * float64(order.Details[i].Quantity)
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

	// Deduct from wallet
	if err := h.walletRepo.SubtractBalance(claims.UserID, order.Total); err != nil {
		utils.ErrorResponse(w, "Failed to process payment", http.StatusInternalServerError)
		return
	}

	// Update product stock
	for _, detail := range order.Details {
		product, _ := h.productRepo.GetByID(detail.ProductID)
		product.Stock -= detail.Quantity
		h.productRepo.Update(product)
	}

	if err := h.orderRepo.Create(&order); err != nil {
		utils.ErrorResponse(w, "Failed to create order", http.StatusInternalServerError)
		return
	}

	// Reload order with relations
	createdOrder, _ := h.orderRepo.GetByID(order.ID)

	utils.SuccessResponse(w, "Order created successfully", createdOrder, http.StatusCreated)
}

func (h *OrderHandler) GetAll(w http.ResponseWriter, r *http.Request) {
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

