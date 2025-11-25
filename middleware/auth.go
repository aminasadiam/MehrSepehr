package middleware

import (
	"net/http"
	"strings"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/utils"
)

func AuthMiddleware(cfg *config.Configuration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				utils.ErrorResponse(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				utils.ErrorResponse(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			claims, err := utils.ValidateToken(parts[1], cfg.JWTSecret)
			if err != nil {
				utils.ErrorResponse(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			// Store claims in request context
			r = r.WithContext(utils.SetUserContext(r.Context(), claims))
			next.ServeHTTP(w, r)
		})
	}
}
