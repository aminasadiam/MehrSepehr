package models

import "gorm.io/gorm"

// Product represents a sellable item (kitchen appliance).
type Product struct {
	gorm.Model
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description,omitempty"`
	SKU         string  `gorm:"uniqueIndex;not null" json:"sku"`
	Price       float64 `gorm:"not null;type:numeric" json:"price"`
	Stock       int     `gorm:"not null;default:0" json:"stock"`

	// Additional fields for kitchen appliances
	ModelNumber string  `json:"model_number,omitempty"` // Product model number
	Warranty    string  `json:"warranty,omitempty"`     // Warranty information (e.g., "2 years")
	Weight      float64 `json:"weight,omitempty"`       // Weight in kg
	Dimensions  string  `json:"dimensions,omitempty"`   // Dimensions (e.g., "30x40x50 cm")
	Power       string  `json:"power,omitempty"`        // Power consumption (e.g., "1000W")
	Material    string  `json:"material,omitempty"`     // Material (e.g., "Stainless Steel")
	Capacity    string  `json:"capacity,omitempty"`     // Capacity (e.g., "5 liters")
	Features    string  `json:"features,omitempty"`     // JSON string or comma-separated features
	IsActive    bool    `gorm:"default:true" json:"is_active"` // Whether product is active/available

	// Category relation
	CategoryID *uint     `json:"category_id,omitempty"`
	Category   *Category `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"category,omitempty"`

	// Brand relation
	BrandID *uint  `json:"brand_id,omitempty"`
	Brand   *Brand `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"brand,omitempty"`

	// Product images (one-to-many)
	Images []ProductImage `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"images,omitempty"`

	// Product sizes (one-to-many)
	Sizes []ProductSize `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sizes,omitempty"`

	// Product colors (one-to-many)
	Colors []ProductColor `gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"colors,omitempty"`

	// Orders through OrderDetail
	OrderDetails []OrderDetail `gorm:"foreignKey:ProductID" json:"-"`

	// Groups for restricted visibility
	Groups []Group `gorm:"many2many:group_products;" json:"groups,omitempty"`
}
