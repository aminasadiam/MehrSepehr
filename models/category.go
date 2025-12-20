package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name     string     `gorm:"not null;uniqueIndex" json:"name"`
	Slug     string     `gorm:"uniqueIndex;not null" json:"slug"`
	ParentID *uint      `json:"parent_id,omitempty"`
	Parent   *Category  `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"parent,omitempty"`
	Children []Category `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Products []Product  `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"products,omitempty"`
}
