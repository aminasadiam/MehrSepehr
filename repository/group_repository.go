package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type GroupRepository struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

func (r *GroupRepository) Create(g *models.Group) error {
	return r.db.Create(g).Error
}

func (r *GroupRepository) GetAll() ([]models.Group, error) {
	var groups []models.Group
	err := r.db.Preload("Users").Preload("Products").Find(&groups).Error
	return groups, err
}

func (r *GroupRepository) GetByID(id uint) (*models.Group, error) {
	var g models.Group
	err := r.db.Preload("Users").Preload("Products").First(&g, id).Error
	return &g, err
}

func (r *GroupRepository) Delete(id uint) error {
	return r.db.Delete(&models.Group{}, id).Error
}

func (r *GroupRepository) AddProduct(groupID, productID uint) error {
	return r.db.Model(&models.Group{Model: gorm.Model{ID: groupID}}).Association("Products").Append(&models.Product{Model: gorm.Model{ID: productID}})
}

func (r *GroupRepository) RemoveProduct(groupID, productID uint) error {
	return r.db.Model(&models.Group{Model: gorm.Model{ID: groupID}}).Association("Products").Delete(&models.Product{Model: gorm.Model{ID: productID}})
}

func (r *GroupRepository) AddUser(groupID, userID uint) error {
	return r.db.Model(&models.Group{Model: gorm.Model{ID: groupID}}).Association("Users").Append(&models.User{Model: gorm.Model{ID: userID}})
}

func (r *GroupRepository) RemoveUser(groupID, userID uint) error {
	return r.db.Model(&models.Group{Model: gorm.Model{ID: groupID}}).Association("Users").Delete(&models.User{Model: gorm.Model{ID: userID}})
}
