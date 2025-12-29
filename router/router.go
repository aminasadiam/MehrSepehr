package router

import (
	"log"
	"net/http"
	"path/filepath"
	"strings"

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

	// --------------------
	// Public routes
	// --------------------
	mux.HandleFunc("GET /", handler.Index)
	mux.HandleFunc("POST /api/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/auth/login", authHandler.Login)

	// --------------------
	// Middleware
	// --------------------
	authMiddleware := middleware.AuthMiddleware(cfg)
	adminMiddleware := middleware.AdminMiddleware(db)

	// --------------------
	// Auth routes
	// --------------------
	mux.Handle("GET /api/auth/profile",
		authMiddleware(http.HandlerFunc(authHandler.GetProfile)),
	)

	// --------------------
	// User routes (admin)
	// --------------------
	mux.Handle("GET /api/users", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.GetAll))))
	mux.Handle("GET /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.GetByID))))
	mux.Handle("PUT /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.Update))))
	mux.Handle("DELETE /api/users/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.Delete))))

	mux.Handle("POST /api/users/{id}/roles", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.AddRole))))
	mux.Handle("DELETE /api/users/{id}/roles/{roleId}", authMiddleware(adminMiddleware(http.HandlerFunc(userHandler.RemoveRole))))

	mux.Handle("POST /api/users/{id}/avatar", authMiddleware(http.HandlerFunc(userHandler.UploadAvatar)))

	// --------------------
	// Product routes (authenticated, admin for create/update/delete)
	// --------------------
	mux.Handle("GET /api/products", authMiddleware(http.HandlerFunc(productHandler.GetAll)))
	mux.Handle("GET /api/products/{id}", authMiddleware(http.HandlerFunc(productHandler.GetByID)))
	mux.Handle("POST /api/products", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Create))))
	mux.Handle("PUT /api/products/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Update))))
	mux.Handle("DELETE /api/products/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.Delete))))

	mux.Handle("POST /api/products/{id}/images", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.UploadImage))))
	mux.Handle("POST /api/products/{id}/prices", authMiddleware(adminMiddleware(http.HandlerFunc(productHandler.AddPrice))))

	// --------------------
	// Category routes
	// --------------------
	mux.Handle("GET /api/admin/categories", http.HandlerFunc(categoryHandler.GetAll))
	mux.Handle("GET /api/admin/categories/{id}", authMiddleware(http.HandlerFunc(categoryHandler.GetByID)))
	mux.Handle("GET /api/admin/categories/slug/{slug}", authMiddleware(http.HandlerFunc(categoryHandler.GetBySlug)))
	mux.Handle("POST /api/admin/categories", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Create))))
	mux.Handle("PUT /api/admin/categories/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Update))))
	mux.Handle("DELETE /api/admin/categories/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(categoryHandler.Delete))))

	// --------------------
	// Brand routes
	// --------------------
	mux.Handle("GET /api/brands", authMiddleware(http.HandlerFunc(brandHandler.GetAll)))
	mux.Handle("GET /api/brands/{id}", authMiddleware(http.HandlerFunc(brandHandler.GetByID)))
	mux.Handle("POST /api/brands", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Create))))
	mux.Handle("PUT /api/brands/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Update))))
	mux.Handle("DELETE /api/brands/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(brandHandler.Delete))))

	// --------------------
	// Order routes (authenticated, admin for all orders)
	// --------------------
	mux.Handle("GET /api/orders", authMiddleware(http.HandlerFunc(orderHandler.GetAllForUser)))
	mux.Handle("GET /api/orders/{id}", authMiddleware(http.HandlerFunc(orderHandler.GetByID)))
	mux.Handle("POST /api/orders", authMiddleware(http.HandlerFunc(orderHandler.Create)))
	mux.Handle("PUT /api/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Update))))
	mux.Handle("DELETE /api/orders/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(orderHandler.Delete))))

	// --------------------
	// Wallet routes
	// --------------------
	mux.Handle("GET /api/wallet", authMiddleware(http.HandlerFunc(walletHandler.GetMyWallet)))
	mux.Handle("POST /api/wallet/add", authMiddleware(http.HandlerFunc(walletHandler.AddBalance)))

	// Admin wallet routes
	mux.Handle("GET /api/admin/wallet/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(walletHandler.GetByID))))
	mux.Handle("POST /api/admin/wallet/{id}/add", authMiddleware(adminMiddleware(http.HandlerFunc(walletHandler.AddBalanceAdmin))))

	// --------------------
	// Roles
	// --------------------
	mux.Handle("GET /api/admin/roles", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.GetAll))))
	mux.Handle("POST /api/admin/roles", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Create))))
	mux.Handle("GET /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.GetByID))))
	mux.Handle("PUT /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Update))))
	mux.Handle("DELETE /api/admin/roles/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.Delete))))

	mux.Handle("POST /api/admin/roles/{id}/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.AddPermission))))
	mux.Handle("DELETE /api/admin/roles/{id}/permissions/{permId}", authMiddleware(adminMiddleware(http.HandlerFunc(roleHandler.RemovePermission))))

	// --------------------
	// Permissions
	// --------------------
	mux.Handle("GET /api/admin/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.GetAll))))
	mux.Handle("POST /api/admin/permissions", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Create))))
	mux.Handle("GET /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.GetByID))))
	mux.Handle("PUT /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Update))))
	mux.Handle("DELETE /api/admin/permissions/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(permissionHandler.Delete))))

	// --------------------
	// Groups
	// --------------------
	mux.Handle("GET /api/admin/groups", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.GetAll))))
	mux.Handle("POST /api/admin/groups", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.Create))))
	mux.Handle("GET /api/admin/groups/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.GetByID))))
	mux.Handle("DELETE /api/admin/groups/{id}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.Delete))))

	mux.Handle("POST /api/admin/groups/{id}/products", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.AddProduct))))
	mux.Handle("DELETE /api/admin/groups/{id}/products/{prodId}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.RemoveProduct))))
	mux.Handle("POST /api/admin/groups/{id}/users", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.AddUser))))
	mux.Handle("DELETE /api/admin/groups/{id}/users/{userId}", authMiddleware(adminMiddleware(http.HandlerFunc(groupHandler.RemoveUser))))

	// --------------------
	// Avatar static assets (BEST PRACTICE)
	// --------------------
	avatarFS := http.FileServer(http.Dir("./uploads/avatars"))

	mux.Handle("GET /assets/avatar/",
		http.StripPrefix("/assets/avatar/",
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ext := strings.ToLower(filepath.Ext(r.URL.Path))
				switch ext {
				case ".png", ".jpg", ".jpeg", ".webp":
					w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
					avatarFS.ServeHTTP(w, r)
				default:
					http.NotFound(w, r)
				}
			}),
		),
	)

	// --------------------
	// Product images static assets
	// --------------------
	productImagesFS := http.FileServer(http.Dir("./uploads/products"))

	mux.Handle("GET /assets/products/",
		http.StripPrefix("/assets/products/",
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ext := strings.ToLower(filepath.Ext(r.URL.Path))
				switch ext {
				case ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif":
					w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
					productImagesFS.ServeHTTP(w, r)
				default:
					http.NotFound(w, r)
				}
			}),
		),
	)

	// --------------------
	// Global middleware
	// --------------------
	httpHandler := middleware.ErrorHandler(mux)
	httpHandler = middleware.CORS(cfg)(httpHandler)

	log.Printf("Server Started at %s\n", cfg.Port)
	return http.ListenAndServe(cfg.Port, httpHandler)
}
