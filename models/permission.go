package models

import "gorm.io/gorm"

// Permission represents a fine-grained permission that can be attached to roles.
type Permission struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	Description string `json:"description,omitempty"`

	// Back-reference
	Roles []Role `gorm:"many2many:role_permissions;" json:"roles,omitempty"`
}
