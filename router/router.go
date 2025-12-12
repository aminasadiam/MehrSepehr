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
	groupHandler := handler.NewGroupHandler(db)
	brandHandler := handler.NewBrandHandler(db)

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("GET /", handler.Index)
	mux.HandleFunc("POST /api/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/auth/login", authHandler.Login)

	// Protected routes (require authentication)
	authMiddleware := middleware.AuthMiddleware(cfg)

	// Admin middleware (checks roles)
	adminMiddleware := middleware.AdminMiddleware(db)

	// Auth routes
	mux.Handle("GET /api/auth/profile", authMiddleware(http.HandlerFunc(authHandler.GetProfile)))

	// User routes (admin access required for management)
	mux.Handle("GET /api/users", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.GetAll))))
	mux.Handle("GET /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.GetByID))))
	mux.Handle("PUT /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.Update))))
	mux.Handle("DELETE /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.Delete))))

	// Product routes (require authentication to view, admin to write)
	mux.Handle("GET /api/products", authMiddleware(http.HandlerFunc(productHandler.GetAll)))
	mux.Handle("GET /api/products/{id}", authMiddleware(http.HandlerFunc(productHandler.GetByID)))
	mux.Handle("POST /api/products", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Create))))
	mux.Handle("PUT /api/products/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Update))))
	mux.Handle("DELETE /api/products/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Delete))))
	mux.Handle("POST /api/products/{id}/images", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.UploadProductImage))))

	// Brand routes (public read, admin write)
	mux.HandleFunc("GET /api/brands", brandHandler.GetAll)
	mux.HandleFunc("GET /api/brands/{id}", brandHandler.GetByID)
	mux.Handle("POST /api/admin/brands", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Create))))
	mux.Handle("PUT /api/admin/brands/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Update))))
	mux.Handle("DELETE /api/admin/brands/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Delete))))

	// Category routes (public read, admin write)
	mux.HandleFunc("GET /api/categories", categoryHandler.GetAll)
	mux.HandleFunc("GET /api/categories/{id}", categoryHandler.GetByID)
	mux.HandleFunc("GET /api/categories/slug/{slug}", categoryHandler.GetBySlug)
	mux.Handle("POST /api/categories", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Create))))
	mux.Handle("PUT /api/categories/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Update))))
	mux.Handle("DELETE /api/categories/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Delete))))

	// Order routes (protected)
	mux.Handle("POST /api/orders", authMiddleware(http.HandlerFunc(orderHandler.Create)))
	mux.Handle("GET /api/orders", authMiddleware(http.HandlerFunc(orderHandler.GetAll)))
	mux.Handle("GET /api/orders/{id}", authMiddleware(http.HandlerFunc(orderHandler.GetByID)))
	mux.Handle("PUT /api/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Update))))
	mux.Handle("DELETE /api/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Delete))))

	// Admin order routes
	mux.Handle("GET /api/admin/orders", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.GetAll))))
	mux.Handle("GET /api/admin/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.GetByID))))
	mux.Handle("PUT /api/admin/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Update))))
	mux.Handle("DELETE /api/admin/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Delete))))

	// Wallet routes (protected)
	mux.Handle("GET /api/wallet", authMiddleware(http.HandlerFunc(walletHandler.GetMyWallet)))
	mux.Handle("POST /api/wallet/add", authMiddleware(http.HandlerFunc(walletHandler.AddBalance)))
	mux.Handle("GET /api/wallet/{id}", authMiddleware(http.HandlerFunc(walletHandler.GetByID)))

	// Admin wallet routes
	mux.Handle("GET /api/admin/wallet/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(walletHandler.GetByID))))
	mux.Handle("POST /api/admin/wallet/{id}/add", authMiddleware(adminMiddleware(http.HandlerFunc(walletHandler.AddBalanceAdmin))))

	// Admin routes: roles and permissions management
	mux.Handle("GET /api/admin/roles", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.GetAll))))
	mux.Handle("POST /api/admin/roles", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Create))))
	mux.Handle("GET /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.GetByID))))
	mux.Handle("PUT /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Update))))
	mux.Handle("DELETE /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Delete))))

	mux.Handle("GET /api/admin/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.GetAll))))
	mux.Handle("POST /api/admin/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Create))))
	mux.Handle("GET /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.GetByID))))
	mux.Handle("PUT /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Update))))
	mux.Handle("DELETE /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Delete))))

	// Admin user role management
	mux.Handle("POST /api/admin/users/{id}/roles", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.AddRole))))
	mux.Handle("DELETE /api/admin/users/{id}/roles/{roleId}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.RemoveRole))))

	// Admin role permission management
	mux.Handle("POST /api/admin/roles/{id}/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.AddPermission))))
	mux.Handle("DELETE /api/admin/roles/{id}/permissions/{permId}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.RemovePermission))))

	// Admin groups management
	mux.Handle("GET /api/admin/groups", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.GetAll))))
	mux.Handle("POST /api/admin/groups", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.Create))))
	mux.Handle("GET /api/admin/groups/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.GetByID))))
	mux.Handle("DELETE /api/admin/groups/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.Delete))))
	// group associations
	mux.Handle("POST /api/admin/groups/{id}/products", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.AddProduct))))
	mux.Handle("DELETE /api/admin/groups/{id}/products/{prodId}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.RemoveProduct))))
	mux.Handle("POST /api/admin/groups/{id}/users", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.AddUser))))
	mux.Handle("DELETE /api/admin/groups/{id}/users/{userId}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.RemoveUser))))

	// Serve uploaded files (only GET requests) - make method explicit to avoid pattern conflicts
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// Avatar upload routes
	mux.Handle("POST /api/users/{id}/avatar", authMiddleware(http.HandlerFunc(userHandler.UploadAvatar)))
	mux.Handle("POST /api/admin/users/{id}/avatar", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.AdminUploadAvatar))))

	// Apply middleware (must be after all routes are registered)
	httpHandler := middleware.ErrorHandler(mux)
	httpHandler = middleware.CORS(cfg)(httpHandler)

	log.Printf("Server Started at %s\n", cfg.Port)

	return http.ListenAndServe(cfg.Port, httpHandler)
}
