package models

import "gorm.io/gorm"

// ProductSize represents a size variant of a product
type ProductSize struct {
	gorm.Model
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"product,omitempty"`
	Name      string  `gorm:"not null" json:"name"` // e.g., "Small", "Medium", "Large", "30x40cm"
	Stock     int     `gorm:"not null;default:0" json:"stock"`
	Price     float64 `gorm:"type:numeric" json:"price,omitempty"` // Optional: different price for this size
}

