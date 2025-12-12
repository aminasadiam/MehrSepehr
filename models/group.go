package models

import "gorm.io/gorm"

// Group represents a named group of users and products for targeted visibility.
type Group struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	Description string `json:"description,omitempty"`

	Users    []User    `gorm:"many2many:user_groups;" json:"users,omitempty"`
	Products []Product `gorm:"many2many:group_products;" json:"products,omitempty"`
}
