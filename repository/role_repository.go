package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) Create(model *models.Role) error {
	return r.db.Create(model).Error
}

func (r *RoleRepository) GetByID(id uint) (*models.Role, error) {
	var role models.Role
	err := r.db.Preload("Users").Preload("Permissions").First(&role, id).Error
	return &role, err
}

func (r *RoleRepository) GetAll() ([]models.Role, error) {
	var roles []models.Role
	err := r.db.Preload("Users").Preload("Permissions").Find(&roles).Error
	return roles, err
}

func (r *RoleRepository) Update(model *models.Role) error {
	return r.db.Save(model).Error
}

func (r *RoleRepository) Delete(id uint) error {
	return r.db.Delete(&models.Role{}, id).Error
}

func (r *RoleRepository) AddPermission(roleID, permissionID uint) error {
	return r.db.Model(&models.Role{Model: gorm.Model{ID: roleID}}).
		Association("Permissions").
		Append(&models.Permission{Model: gorm.Model{ID: permissionID}})
}

func (r *RoleRepository) RemovePermission(roleID, permissionID uint) error {
	return r.db.Model(&models.Role{Model: gorm.Model{ID: roleID}}).
		Association("Permissions").
		Delete(&models.Permission{Model: gorm.Model{ID: permissionID}})
}

