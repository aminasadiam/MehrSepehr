package main

import (
	"log"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/router"
)

func main() {
	cfg := config.Load()
	
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	err := router.Serve(cfg)
	if err != nil {
		log.Fatal(err)
	}
}
