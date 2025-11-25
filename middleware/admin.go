package middleware

import (
	"net/http"

	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/gorm"
)

// AdminMiddleware ensures the authenticated user has the "admin" role.
func AdminMiddleware(db *gorm.DB) func(http.Handler) http.Handler {
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

			for _, role := range user.Roles {
				if role.Name == "admin" || role.Name == "administrator" {
					next.ServeHTTP(w, r)
					return
				}
			}

			utils.ErrorResponse(w, "Forbidden: admin access required", http.StatusForbidden)
		})
	}
}
