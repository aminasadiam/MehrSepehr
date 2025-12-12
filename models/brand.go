package models

import "gorm.io/gorm"

// Brand represents a product brand/manufacturer
type Brand struct {
	gorm.Model
	Name        string `gorm:"not null;uniqueIndex" json:"name"`
	Description string `json:"description,omitempty"`
	Logo        string `json:"logo,omitempty"` // URL or path to logo image

	// Products of this brand
	Products []Product `gorm:"foreignKey:BrandID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"products,omitempty"`
}

