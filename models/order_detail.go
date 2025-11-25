package models

import "gorm.io/gorm"

// OrderDetail is a line item in an order linking product and quantity.
type OrderDetail struct {
	gorm.Model
	OrderID uint   `json:"order_id"`
	Order   *Order `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"order,omitempty"`

	ProductID uint     `json:"product_id"`
	Product   *Product `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"product,omitempty"`

	Quantity  int     `gorm:"not null;default:1" json:"quantity"`
	UnitPrice float64 `gorm:"type:numeric;not null" json:"unit_price"`
	Subtotal  float64 `gorm:"type:numeric;not null" json:"subtotal"`
}
