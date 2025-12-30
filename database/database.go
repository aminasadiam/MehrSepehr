package database

import (
	"log"

	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/utils"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("Connected to Database.")

	db.AutoMigrate(&models.User{}, &models.Role{}, &models.Permission{}, &models.Wallet{}, &models.Brand{}, &models.Product{}, &models.ProductImage{}, &models.ProductPrice{}, &models.ProductSize{}, &models.ProductColor{}, &models.Category{}, &models.Order{}, &models.OrderDetail{}, &models.Group{})

	log.Println("Migration is Successfull.")

	// Seed admin user if no users exist
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		log.Printf("failed to count users: %v", err)
	} else if userCount == 0 {
		log.Println("No users found, seeding default admin user...")

		// ensure admin role exists
		var adminRole models.Role
		if err := db.Where("name = ? OR name = ?", "admin", "administrator").First(&adminRole).Error; err != nil {
			adminRole = models.Role{Name: "admin", Description: "Administrator role"}
			if err := db.Create(&adminRole).Error; err != nil {
				log.Printf("failed to create admin role: %v", err)
			}
		}

		// create admin user with default credentials
		hashed, err := utils.HashPassword("admin")
		if err != nil {
			log.Printf("failed to hash admin password: %v", err)
		} else {
			adminUser := models.User{Username: "admin", Email: "admin@example.com", Password: hashed}
			if err := db.Create(&adminUser).Error; err != nil {
				log.Printf("failed to create admin user: %v", err)
			} else {
				// create wallet for admin
				wallet := models.Wallet{UserID: adminUser.ID, Balance: 0, Currency: "USD"}
				if err := db.Create(&wallet).Error; err != nil {
					log.Printf("failed to create wallet for admin user: %v", err)
				}

				// assign admin role
				if adminRole.ID != 0 {
					if err := db.Table("user_roles").Create(map[string]interface{}{"user_id": adminUser.ID, "role_id": adminRole.ID}).Error; err != nil {
						log.Printf("failed to assign admin role to user: %v", err)
					}
				}

				log.Printf("Seeded admin user: %s (id=%d)", adminUser.Email, adminUser.ID)
			}
		}
	}

	return db, nil
}
