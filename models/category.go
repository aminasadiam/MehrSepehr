package models

import "gorm.io/gorm"

// Category groups products together.
type Category struct {
	gorm.Model
	Name string `gorm:"not null;uniqueIndex" json:"name"`
	Slug string `gorm:"uniqueIndex;not null" json:"slug"`

	// Products in this category
	Products []Product `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"products,omitempty"`
}
