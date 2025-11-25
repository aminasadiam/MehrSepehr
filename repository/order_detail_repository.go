package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type OrderDetailRepository struct {
	db *gorm.DB
}

func NewOrderDetailRepository(db *gorm.DB) *OrderDetailRepository {
	return &OrderDetailRepository{db: db}
}

func (r *OrderDetailRepository) Create(model *models.OrderDetail) error {
	return r.db.Create(model).Error
}

func (r *OrderDetailRepository) GetByID(id uint) (*models.OrderDetail, error) {
	var detail models.OrderDetail
	err := r.db.Preload("Order").Preload("Product").First(&detail, id).Error
	return &detail, err
}

func (r *OrderDetailRepository) GetByOrderID(orderID uint) ([]models.OrderDetail, error) {
	var details []models.OrderDetail
	err := r.db.Where("order_id = ?", orderID).Preload("Product").Find(&details).Error
	return details, err
}

func (r *OrderDetailRepository) Update(model *models.OrderDetail) error {
	return r.db.Save(model).Error
}

func (r *OrderDetailRepository) Delete(id uint) error {
	return r.db.Delete(&models.OrderDetail{}, id).Error
}
