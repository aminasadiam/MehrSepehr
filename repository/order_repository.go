package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(model *models.Order) error {
	return r.db.Create(model).Error
}

func (r *OrderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("User").Preload("Details").Preload("Details.Product").First(&order, id).Error
	return &order, err
}

func (r *OrderRepository) GetAll() ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Preload("User").Preload("Details").Preload("Details.Product").Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) GetByUserID(userID uint) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Where("user_id = ?", userID).Preload("Details").Preload("Details.Product").Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) Update(model *models.Order) error {
	return r.db.Save(model).Error
}

func (r *OrderRepository) Delete(id uint) error {
	return r.db.Delete(&models.Order{}, id).Error
}
