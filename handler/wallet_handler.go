package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

type WalletHandler struct {
	walletRepo *repository.WalletRepository
}

func NewWalletHandler(db *gorm.DB) *WalletHandler {
	return &WalletHandler{
		walletRepo: repository.NewWalletRepository(db),
	}
}

func (h *WalletHandler) GetMyWallet(w http.ResponseWriter, r *http.Request) {
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	wallet, err := h.walletRepo.GetByUserID(claims.UserID)
	if err != nil {
		utils.ErrorResponse(w, "Wallet not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, wallet, http.StatusOK)
}

func (h *WalletHandler) AddBalance(w http.ResponseWriter, r *http.Request) {
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Amount float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 {
		utils.ErrorResponse(w, "Amount must be greater than 0", http.StatusBadRequest)
		return
	}

	if err := h.walletRepo.AddBalance(claims.UserID, req.Amount); err != nil {
		utils.ErrorResponse(w, "Failed to add balance", http.StatusInternalServerError)
		return
	}

	wallet, _ := h.walletRepo.GetByUserID(claims.UserID)
	utils.SuccessResponse(w, "Balance added successfully", wallet, http.StatusOK)
}

func (h *WalletHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid wallet ID", http.StatusBadRequest)
		return
	}

	wallet, err := h.walletRepo.GetByID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Wallet not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, wallet, http.StatusOK)
}

// AddBalanceAdmin allows admin to add balance to any user's wallet by user ID in path
// POST /api/admin/wallet/{id}/add with JSON { amount }
func (h *WalletHandler) AddBalanceAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Amount float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Amount == 0 {
		utils.ErrorResponse(w, "Amount required", http.StatusBadRequest)
		return
	}

	if err := h.walletRepo.AddBalance(uint(id), req.Amount); err != nil {
		utils.ErrorResponse(w, "Failed to add balance", http.StatusInternalServerError)
		return
	}

	wallet, err := h.walletRepo.GetByUserID(uint(id))
	if err != nil {
		utils.ErrorResponse(w, "Wallet not found after update", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Balance added", wallet, http.StatusOK)
}
