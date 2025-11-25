package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/database"
	"github.com/aminasadiam/Kasra/models"
	"github.com/aminasadiam/Kasra/repository"
	"github.com/aminasadiam/Kasra/utils"
)

func main() {
	username := flag.String("username", "admin", "admin username")
	email := flag.String("email", "admin@example.com", "admin email")
	password := flag.String("password", "change-me", "admin password")
	flag.Parse()

	cfg := config.Load()
	db, err := database.Connect(cfg.Dsn)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}

	roleRepo := repository.NewRoleRepository(db)
	userRepo := repository.NewUserRepository(db)
	walletRepo := repository.NewWalletRepository(db)

	// Ensure admin role exists
	var adminRole *models.Role
	roles, err := roleRepo.GetAll()
	if err != nil {
		log.Fatalf("failed to fetch roles: %v", err)
	}
	for _, r := range roles {
		if r.Name == "admin" || r.Name == "administrator" {
			adminRole = &r
			break
		}
	}
	if adminRole == nil {
		r := &models.Role{Name: "admin", Description: "Administrator role"}
		if err := roleRepo.Create(r); err != nil {
			log.Fatalf("failed to create admin role: %v", err)
		}
		adminRole = r
		fmt.Println("Created role 'admin'")
	} else {
		fmt.Println("Admin role already exists")
	}

	// Ensure user exists
	user, err := userRepo.GetByEmail(*email)
	if err == nil && user != nil {
		fmt.Printf("User with email %s already exists (id=%d)\n", *email, user.ID)
		// Ensure user has admin role
		if err := userRepo.AddRole(user.ID, adminRole.ID); err != nil {
			log.Fatalf("failed to add role to existing user: %v", err)
		}
		fmt.Println("Assigned admin role to existing user")
		return
	}

	// Create user
	hashed, err := utils.HashPassword(*password)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}
	newUser := &models.User{Username: *username, Email: *email, Password: hashed}
	if err := userRepo.Create(newUser); err != nil {
		log.Fatalf("failed to create admin user: %v", err)
	}
	fmt.Printf("Created admin user %s (id=%d)\n", newUser.Email, newUser.ID)

	// Create wallet for user
	wallet := &models.Wallet{UserID: newUser.ID, Balance: 0, Currency: "USD"}
	if err := walletRepo.Create(wallet); err != nil {
		log.Fatalf("failed to create wallet for admin user: %v", err)
	}

	// Assign admin role
	if err := userRepo.AddRole(newUser.ID, adminRole.ID); err != nil {
		log.Fatalf("failed to assign admin role: %v", err)
	}
	fmt.Println("Assigned admin role to new user")
}
