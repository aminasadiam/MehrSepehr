package models

import "gorm.io/gorm"

// User represents an application user.
// Users can have many roles, many orders and one wallet.
type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null" json:"username"`
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`

	// Relations
	Roles  []Role  `gorm:"many2many:user_roles;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"roles,omitempty"`
	Orders []Order `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"orders,omitempty"`
	Wallet *Wallet `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"wallet,omitempty"`
}
