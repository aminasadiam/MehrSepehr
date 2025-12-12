package models

import "gorm.io/gorm"

// ProductImage represents an image for a product
type ProductImage struct {
	gorm.Model
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"product,omitempty"`
	URL       string  `gorm:"not null" json:"url"` // Path or URL to the image
	Alt       string  `json:"alt,omitempty"`       // Alt text for accessibility
	IsPrimary bool    `gorm:"default:false" json:"is_primary"` // Primary image for the product
	Order     int     `gorm:"default:0" json:"order"`           // Display order
}

