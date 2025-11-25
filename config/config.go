package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Configuration struct {
	Port      string
	Dsn       string
	JWTSecret string
}

func Load() *Configuration {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	port := os.Getenv("PORT")
	dsn := os.Getenv("DSN")
	jwtSecret := os.Getenv("JWT_SECRET")

	return &Configuration{
		Port:      port,
		Dsn:       dsn,
		JWTSecret: jwtSecret,
	}
}
