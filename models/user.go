package models

import "gorm.io/gorm"

// User represents an application user.
// Users can have many roles, many orders and one wallet.
type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null" json:"username"`
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`
	// Phone number and avatar (profile picture URL)
	Phone  string `gorm:"size:32" json:"phone,omitempty"`
	Avatar string `gorm:"size:255" json:"avatar,omitempty"`

	// Relations
	Roles  []Role  `gorm:"many2many:user_roles;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"roles,omitempty"`
	Orders []Order `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"orders,omitempty"`
	Wallet *Wallet `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"wallet,omitempty"`

	// Groups the user belongs to
	Groups []Group `gorm:"many2many:user_groups;" json:"groups,omitempty"`
}
