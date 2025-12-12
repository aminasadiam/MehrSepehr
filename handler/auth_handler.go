package handler

import (
	"encoding/json"
	"net/http"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

type AuthHandler struct {
	userRepo   *repository.UserRepository
	walletRepo *repository.WalletRepository
	cfg        *config.Configuration
}

func NewAuthHandler(db *gorm.DB, cfg *config.Configuration) *AuthHandler {
	return &AuthHandler{
		userRepo:   repository.NewUserRepository(db),
		walletRepo: repository.NewWalletRepository(db),
		cfg:        cfg,
	}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone,omitempty"`
	Avatar   string `json:"avatar,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		utils.ErrorResponse(w, "Username, email, and password are required", http.StatusBadRequest)
		return
	}

	// Check if user exists
	_, err := h.userRepo.GetByEmail(req.Email)
	if err == nil {
		utils.ErrorResponse(w, "Email already exists", http.StatusConflict)
		return
	}

	_, err = h.userRepo.GetByUsername(req.Username)
	if err == nil {
		utils.ErrorResponse(w, "Username already exists", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.ErrorResponse(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create user
	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Phone:    req.Phone,
		Avatar:   req.Avatar,
	}

	if err := h.userRepo.Create(user); err != nil {
		utils.ErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Create wallet for user
	wallet := &models.Wallet{
		UserID:   user.ID,
		Balance:  0,
		Currency: "USD",
	}
	if err := h.walletRepo.Create(wallet); err != nil {
		utils.ErrorResponse(w, "Failed to create wallet", http.StatusInternalServerError)
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email, h.cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "User registered successfully", map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
		},
	}, http.StatusCreated)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		utils.ErrorResponse(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Get user
	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil {
		utils.ErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		utils.ErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email, h.cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	utils.SuccessResponse(w, "Login successful", map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
		},
	}, http.StatusOK)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := utils.GetUserFromContext(r.Context())
	if !ok {
		utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.GetByID(claims.UserID)
	if err != nil {
		utils.ErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	utils.JSONResponse(w, user, http.StatusOK)
}
