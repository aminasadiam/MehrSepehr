package middleware

import (
	"net/http"

	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

// PermissionMiddleware checks whether the authenticated user has a specific permission.
func PermissionMiddleware(db *gorm.DB, permName string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := utils.GetUserFromContext(r.Context())
			if !ok {
				utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			userRepo := repository.NewUserRepository(db)
			user, err := userRepo.GetByID(claims.UserID)
			if err != nil {
				utils.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Check user's roles for the permission
			for _, role := range user.Roles {
				for _, p := range role.Permissions {
					if p.Name == permName {
						next.ServeHTTP(w, r)
						return
					}
				}
			}

			utils.ErrorResponse(w, "Forbidden: permission required", http.StatusForbidden)
		})
	}
}
