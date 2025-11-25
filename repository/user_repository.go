package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(model *models.User) error {
	return r.db.Create(model).Error
}

func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Roles").Preload("Roles.Permissions").Preload("Wallet").First(&user, id).Error
	return &user, err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).Preload("Roles").Preload("Roles.Permissions").Preload("Wallet").First(&user).Error
	return &user, err
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).Preload("Roles").Preload("Roles.Permissions").Preload("Wallet").First(&user).Error
	return &user, err
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Roles").Preload("Wallet").Find(&users).Error
	return users, err
}

func (r *UserRepository) Update(model *models.User) error {
	return r.db.Save(model).Error
}

func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *UserRepository) AddRole(userID, roleID uint) error {
	return r.db.Model(&models.User{Model: gorm.Model{ID: userID}}).
		Association("Roles").
		Append(&models.Role{Model: gorm.Model{ID: roleID}})
}

func (r *UserRepository) RemoveRole(userID, roleID uint) error {
	return r.db.Model(&models.User{Model: gorm.Model{ID: userID}}).
		Association("Roles").
		Delete(&models.Role{Model: gorm.Model{ID: roleID}})
}