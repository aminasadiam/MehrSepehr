package models

import "gorm.io/gorm"

// Product represents a sellable item.
type Product struct {
	gorm.Model
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description,omitempty"`
	SKU         string  `gorm:"uniqueIndex;not null" json:"sku"`
	Price       float64 `gorm:"not null;type:numeric" json:"price"`
	Stock       int     `gorm:"not null;default:0" json:"stock"`

	// Category relation
	CategoryID *uint     `json:"category_id,omitempty"`
	Category   *Category `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"category,omitempty"`

	// Orders through OrderDetail
	OrderDetails []OrderDetail `gorm:"foreignKey:ProductID" json:"-"`
}
