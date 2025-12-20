package models

import "gorm.io/gorm"

// Product represents a sellable item (kitchen appliance).
type Product struct {
	gorm.Model
	Name        string `gorm:"not null" json:"name"`
	Description string `json:"description,omitempty"`
	SKU         string `gorm:"uniqueIndex;not null" json:"sku"`
	Stock       int    `gorm:"not null;default:0" json:"stock"`

	// Additional fields for kitchen appliances
	ModelNumber string  `json:"model_number,omitempty"`
	Warranty    string  `json:"warranty,omitempty"`
	Weight      float64 `json:"weight,omitempty"`
	Dimensions  string  `json:"dimensions,omitempty"`
	Power       string  `json:"power,omitempty"`
	Material    string  `json:"material,omitempty"`
	Capacity    string  `json:"capacity,omitempty"`
	Features    string  `json:"features,omitempty"`
	IsActive    bool    `gorm:"default:true" json:"is_active"`

	// Category relation
	CategoryID *uint     `json:"category_id,omitempty"`
	Category   *Category `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"category,omitempty"`

	// Brand relation
	BrandID *uint  `json:"brand_id,omitempty"`
	Brand   *Brand `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"brand,omitempty"`

	// Product images
	Images []ProductImage `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"images,omitempty"`

	// Product sizes
	Sizes []ProductSize `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sizes,omitempty"`

	// Product colors
	Colors []ProductColor `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"colors,omitempty"`

	// Prices (dynamic per group)
	Prices []ProductPrice `gorm:"foreignKey:ProductID" json:"prices,omitempty"`

	// Order details
	OrderDetails []OrderDetail `gorm:"foreignKey:ProductID" json:"-"`

	// Groups for restricted visibility
	Groups []Group `gorm:"many2many:group_products;" json:"groups,omitempty"`

	// فیلد موقت برای نمایش قیمت پویا در JSON (نه در دیتابیس)
	Price float64 `gorm:"-" json:"price,omitempty"`
}
