package models

import "gorm.io/gorm"

// Role represents a named role which can be assigned to users.
// Roles can have many permissions and many users.
type Role struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	Description string `json:"description,omitempty"`

	// Relations
	Users       []User       `gorm:"many2many:user_roles;" json:"users,omitempty"`
	Permissions []Permission `gorm:"many2many:role_permissions;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"permissions,omitempty"`
}
