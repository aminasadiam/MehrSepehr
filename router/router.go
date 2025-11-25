package router

import (
	"log"
	"net/http"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/database"
	"github.com/aminasadiam/Kasra/handler"
	"github.com/aminasadiam/Kasra/middleware"
)

func Serve(cfg *config.Configuration) error {
	// Connect to database
	db, err := database.Connect(cfg.Dsn)
	if err != nil {
		return err
	}

	// Initialize handlers
	authHandler := handler.NewAuthHandler(db, cfg)
	userHandler := handler.NewUserHandler(db)
	productHandler := handler.NewProductHandler(db)
	categoryHandler := handler.NewCategoryHandler(db)
	orderHandler := handler.NewOrderHandler(db)
	walletHandler := handler.NewWalletHandler(db)
	roleHandler := handler.NewRoleHandler(db)
	permissionHandler := handler.NewPermissionHandler(db)

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("GET /", handler.Index)

	// Apply middleware
	httpHandler := middleware.ErrorHandler(mux)
	httpHandler = middleware.CORS(httpHandler)
	mux.HandleFunc("POST /api/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/auth/login", authHandler.Login)

	// Protected routes (require authentication)
	authMiddleware := middleware.AuthMiddleware(cfg)

	// Admin middleware (checks roles)
	adminMiddleware := middleware.AdminMiddleware(db)

	// Auth routes
	mux.Handle("GET /api/auth/profile", authMiddleware(http.HandlerFunc(authHandler.GetProfile)))

	// User routes (admin access required for management)
	mux.Handle("GET /api/users", adminMiddleware(http.HandlerFunc(userHandler.GetAll)))
	mux.Handle("GET /api/users/{id}", adminMiddleware(http.HandlerFunc(userHandler.GetByID)))
	mux.Handle("PUT /api/users/{id}", adminMiddleware(http.HandlerFunc(userHandler.Update)))
	mux.Handle("DELETE /api/users/{id}", adminMiddleware(http.HandlerFunc(userHandler.Delete)))

	// Product routes (public read, admin write)
	mux.HandleFunc("GET /api/products", productHandler.GetAll)
	mux.HandleFunc("GET /api/products/{id}", productHandler.GetByID)
	mux.Handle("POST /api/products", adminMiddleware(http.HandlerFunc(productHandler.Create)))
	mux.Handle("PUT /api/products/{id}", adminMiddleware(http.HandlerFunc(productHandler.Update)))
	mux.Handle("DELETE /api/products/{id}", adminMiddleware(http.HandlerFunc(productHandler.Delete)))

	// Category routes (public read, admin write)
	mux.HandleFunc("GET /api/categories", categoryHandler.GetAll)
	mux.HandleFunc("GET /api/categories/{id}", categoryHandler.GetByID)
	mux.HandleFunc("GET /api/categories/slug/{slug}", categoryHandler.GetBySlug)
	mux.Handle("POST /api/categories", adminMiddleware(http.HandlerFunc(categoryHandler.Create)))
	mux.Handle("PUT /api/categories/{id}", adminMiddleware(http.HandlerFunc(categoryHandler.Update)))
	mux.Handle("DELETE /api/categories/{id}", adminMiddleware(http.HandlerFunc(categoryHandler.Delete)))

	// Order routes (protected)
	mux.Handle("POST /api/orders", authMiddleware(http.HandlerFunc(orderHandler.Create)))
	mux.Handle("GET /api/orders", authMiddleware(http.HandlerFunc(orderHandler.GetAll)))
	mux.Handle("GET /api/orders/{id}", authMiddleware(http.HandlerFunc(orderHandler.GetByID)))
	mux.Handle("PUT /api/orders/{id}", adminMiddleware(http.HandlerFunc(orderHandler.Update)))
	mux.Handle("DELETE /api/orders/{id}", adminMiddleware(http.HandlerFunc(orderHandler.Delete)))

	// Admin order routes
	mux.Handle("GET /api/admin/orders", adminMiddleware(http.HandlerFunc(orderHandler.GetAll)))
	mux.Handle("GET /api/admin/orders/{id}", adminMiddleware(http.HandlerFunc(orderHandler.GetByID)))
	mux.Handle("PUT /api/admin/orders/{id}", adminMiddleware(http.HandlerFunc(orderHandler.Update)))
	mux.Handle("DELETE /api/admin/orders/{id}", adminMiddleware(http.HandlerFunc(orderHandler.Delete)))

	// Wallet routes (protected)
	mux.Handle("GET /api/wallet", authMiddleware(http.HandlerFunc(walletHandler.GetMyWallet)))
	mux.Handle("POST /api/wallet/add", authMiddleware(http.HandlerFunc(walletHandler.AddBalance)))
	mux.Handle("GET /api/wallet/{id}", authMiddleware(http.HandlerFunc(walletHandler.GetByID)))

	// Admin wallet routes
	mux.Handle("GET /api/admin/wallet/{id}", adminMiddleware(http.HandlerFunc(walletHandler.GetByID)))
	mux.Handle("POST /api/admin/wallet/{id}/add", adminMiddleware(http.HandlerFunc(walletHandler.AddBalanceAdmin)))

	// Admin routes: roles and permissions management
	mux.Handle("GET /api/admin/roles", adminMiddleware(http.HandlerFunc(roleHandler.GetAll)))
	mux.Handle("POST /api/admin/roles", adminMiddleware(http.HandlerFunc(roleHandler.Create)))
	mux.Handle("GET /api/admin/roles/{id}", adminMiddleware(http.HandlerFunc(roleHandler.GetByID)))
	mux.Handle("PUT /api/admin/roles/{id}", adminMiddleware(http.HandlerFunc(roleHandler.Update)))
	mux.Handle("DELETE /api/admin/roles/{id}", adminMiddleware(http.HandlerFunc(roleHandler.Delete)))

	mux.Handle("GET /api/admin/permissions", adminMiddleware(http.HandlerFunc(permissionHandler.GetAll)))
	mux.Handle("POST /api/admin/permissions", adminMiddleware(http.HandlerFunc(permissionHandler.Create)))
	mux.Handle("GET /api/admin/permissions/{id}", adminMiddleware(http.HandlerFunc(permissionHandler.GetByID)))
	mux.Handle("PUT /api/admin/permissions/{id}", adminMiddleware(http.HandlerFunc(permissionHandler.Update)))
	mux.Handle("DELETE /api/admin/permissions/{id}", adminMiddleware(http.HandlerFunc(permissionHandler.Delete)))

	// Admin user role management
	mux.Handle("POST /api/admin/users/{id}/roles", adminMiddleware(http.HandlerFunc(userHandler.AddRole)))
	mux.Handle("DELETE /api/admin/users/{id}/roles/{roleId}", adminMiddleware(http.HandlerFunc(userHandler.RemoveRole)))

	// Admin role permission management
	mux.Handle("POST /api/admin/roles/{id}/permissions", adminMiddleware(http.HandlerFunc(roleHandler.AddPermission)))
	mux.Handle("DELETE /api/admin/roles/{id}/permissions/{permId}", adminMiddleware(http.HandlerFunc(roleHandler.RemovePermission)))

	log.Printf("Server Started at %s\n", cfg.Port)

	return http.ListenAndServe(cfg.Port, httpHandler)
}
