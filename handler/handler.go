package handler

import (
	"net/http"

	"github.com/aminasadiam/Kasra/utils"
)

func Index(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, "API is running", map[string]string{
		"message": "Welcome to Kasra API",
		"version": "1.0.0",
	}, http.StatusOK)
}
