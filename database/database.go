package database

import (
	"log"

	"github.com/aminasadiam/Kasra/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("Connected to Database.")

	db.AutoMigrate(&models.User{}, &models.Role{}, &models.Permission{}, &models.Wallet{}, &models.Product{}, &models.Category{}, &models.Order{}, &models.OrderDetail{})

	log.Println("Migration is Successfull.")

	return db, nil
}
