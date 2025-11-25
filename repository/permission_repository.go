package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) Create(model *models.Permission) error {
	return r.db.Create(model).Error
}

func (r *PermissionRepository) GetByID(id uint) (*models.Permission, error) {
	var permission models.Permission
	err := r.db.Preload("Roles").First(&permission, id).Error
	return &permission, err
}

func (r *PermissionRepository) GetAll() ([]models.Permission, error) {
	var permissions []models.Permission
	err := r.db.Preload("Roles").Find(&permissions).Error
	return permissions, err
}

func (r *PermissionRepository) Update(model *models.Permission) error {
	return r.db.Save(model).Error
}

func (r *PermissionRepository) Delete(id uint) error {
	return r.db.Delete(&models.Permission{}, id).Error
}

