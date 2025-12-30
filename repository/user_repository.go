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
	err := r.db.Preload("Roles").Preload("Roles.Permissions").Preload("Groups").Preload("Wallet").First(&user, id).Error
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
	err := r.db.Preload("Roles").Preload("Groups").Preload("Wallet").Find(&users).Error
	return users, err
}

func (r *UserRepository) Update(model *models.User) error {
	return r.db.Save(model).Error
}

func (r *UserRepository) Delete(id uint) error {
	// remove associations first
	if err := r.db.Table("user_roles").Where("user_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	if err := r.db.Table("user_groups").Where("user_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	return r.db.Delete(&models.User{}, id).Error
}

func (r *UserRepository) AddRole(userID, roleID uint) error {
	// ensure both exist
	if err := r.db.Where("id = ?", userID).First(&models.User{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("id = ?", roleID).First(&models.Role{}).Error; err != nil {
		return err
	}
	return r.db.Table("user_roles").Create(map[string]interface{}{"user_id": userID, "role_id": roleID}).Error
}

func (r *UserRepository) RemoveRole(userID, roleID uint) error {
	return r.db.Table("user_roles").Where("user_id = ? AND role_id = ?", userID, roleID).Delete(nil).Error
}
