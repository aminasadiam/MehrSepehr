package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Configuration struct {
	Port           string
	Dsn            string
	JWTSecret      string
	AllowedOrigins string
}

func Load() *Configuration {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	} else if port[0] != ':' {
		port = ":" + port
	}

	dsn := os.Getenv("DSN")
	if dsn == "" {
		log.Fatal("DSN environment variable is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	return &Configuration{
		Port:           port,
		Dsn:            dsn,
		JWTSecret:      jwtSecret,
		AllowedOrigins: allowedOrigins,
	}
}
