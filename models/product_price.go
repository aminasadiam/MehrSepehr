package models

import "gorm.io/gorm"

type ProductPrice struct {
	gorm.Model
	ProductID uint    `gorm:"index;not null" json:"product_id"`
	Product   Product `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	GroupID   *uint   `gorm:"index" json:"group_id,omitempty"` // nil = قیمت پیش‌فرض برای همه
	Group     *Group  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"group,omitempty"`
	Price     float64 `gorm:"type:numeric;not null" json:"price"`
}
