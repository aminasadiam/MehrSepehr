package models

import "gorm.io/gorm"

// Wallet stores a user's balance.
type Wallet struct {
	gorm.Model
	UserID uint  `gorm:"uniqueIndex;not null" json:"user_id"`
	User   *User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user,omitempty"`

	Balance  float64 `gorm:"type:numeric;not null;default:0" json:"balance"`
	Currency string  `gorm:"not null;default:'USD'" json:"currency"`
}
