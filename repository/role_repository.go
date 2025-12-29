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
	// remove associations first
	if err := r.db.Table("role_permissions").Where("role_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	if err := r.db.Table("user_roles").Where("role_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	return r.db.Delete(&models.Role{}, id).Error
}

func (r *RoleRepository) AddPermission(roleID, permissionID uint) error {
	// ensure both exist
	if err := r.db.Where("id = ?", roleID).First(&models.Role{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("id = ?", permissionID).First(&models.Permission{}).Error; err != nil {
		return err
	}
	return r.db.Table("role_permissions").Create(map[string]interface{}{"role_id": roleID, "permission_id": permissionID}).Error
}

func (r *RoleRepository) RemovePermission(roleID, permissionID uint) error {
	return r.db.Table("role_permissions").Where("role_id = ? AND permission_id = ?", roleID, permissionID).Delete(nil).Error
}
