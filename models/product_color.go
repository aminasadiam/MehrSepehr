package models

import "gorm.io/gorm"

// ProductColor represents a color variant of a product
type ProductColor struct {
	gorm.Model
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"product,omitempty"`
	Name      string  `gorm:"not null" json:"name"` // e.g., "Red", "Blue", "Stainless Steel"
	HexCode   string  `json:"hex_code,omitempty"`   // Color hex code for display
	Stock     int     `gorm:"not null;default:0" json:"stock"`
}

