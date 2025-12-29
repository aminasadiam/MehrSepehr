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
	// remove associations first to avoid foreign key constraint errors
	if err := r.db.Table("group_products").Where("group_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	if err := r.db.Table("user_groups").Where("group_id = ?", id).Delete(nil).Error; err != nil {
		return err
	}
	return r.db.Delete(&models.Group{}, id).Error
}

func (r *GroupRepository) AddProduct(groupID, productID uint) error {
	// First verify both group and product exist
	if err := r.db.Where("id = ?", productID).First(&models.Product{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("id = ?", groupID).First(&models.Group{}).Error; err != nil {
		return err
	}
	// Add to many-to-many table without modifying products table
	return r.db.Table("group_products").Create(map[string]interface{}{"group_id": groupID, "product_id": productID}).Error
}

func (r *GroupRepository) RemoveProduct(groupID, productID uint) error {
	// First verify the product exists
	if err := r.db.Where("id = ?", productID).First(&models.Product{}).Error; err != nil {
		return err
	}
	// Remove from join table
	return r.db.Table("group_products").Where("group_id = ? AND product_id = ?", groupID, productID).Delete(nil).Error
}

func (r *GroupRepository) AddUser(groupID, userID uint) error {
	// First verify both group and user exist
	if err := r.db.Where("id = ?", userID).First(&models.User{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("id = ?", groupID).First(&models.Group{}).Error; err != nil {
		return err
	}
	// Add to many-to-many table without modifying users table
	return r.db.Table("user_groups").Create(map[string]interface{}{"group_id": groupID, "user_id": userID}).Error
}

func (r *GroupRepository) RemoveUser(groupID, userID uint) error {
	// First verify the user exists
	if err := r.db.Where("id = ?", userID).First(&models.User{}).Error; err != nil {
		return err
	}
	// Remove from join table
	return r.db.Table("user_groups").Where("group_id = ? AND user_id = ?", groupID, userID).Delete(nil).Error
}
