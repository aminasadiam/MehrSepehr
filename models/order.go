package models

import "gorm.io/gorm"

// Order represents a user's purchase order.
type Order struct {
	gorm.Model
	UserID uint  `json:"user_id"`
	User   *User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user,omitempty"`

	Total         float64 `gorm:"type:numeric;not null;default:0" json:"total"`
	Status        string  `gorm:"not null;default:'pending'" json:"status"`
	Address       string  `json:"address,omitempty"`
	PaymentMethod string  `json:"payment_method,omitempty"`

	Details []OrderDetail `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"details,omitempty"`
}
