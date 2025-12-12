package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(model *models.Product) error {
	return r.db.Create(model).Error
}

func (r *ProductRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.Preload("Category").Preload("Brand").Preload("Images").Preload("Sizes").Preload("Colors").Preload("Groups").First(&product, id).Error
	return &product, err
}

func (r *ProductRepository) GetAll() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Preload("Category").Preload("Brand").Preload("Images").Preload("Sizes").Preload("Colors").Preload("Groups").Find(&products).Error
	return products, err
}

func (r *ProductRepository) Update(model *models.Product) error {
	return r.db.Save(model).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *ProductRepository) GetByCategory(categoryID uint) ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("category_id = ?", categoryID).Preload("Category").Preload("Brand").Preload("Images").Preload("Sizes").Preload("Colors").Find(&products).Error
	return products, err
}

// Search products by free text (name, description, sku, brand) with optional category and brand filters.
func (r *ProductRepository) Search(q string, categoryID *uint, brandID *uint) ([]models.Product, error) {
	var products []models.Product
	db := r.db.Model(&models.Product{}).
		Joins("LEFT JOIN brands ON brands.id = products.brand_id")

	if q != "" {
		like := "%" + q + "%"
		db = db.Where(
			r.db.Where("LOWER(products.name) LIKE ?", like).
				Or("LOWER(products.description) LIKE ?", like).
				Or("LOWER(products.sku) LIKE ?", like).
				Or("LOWER(brands.name) LIKE ?", like),
		)
	}

	if categoryID != nil {
		db = db.Where("products.category_id = ?", *categoryID)
	}

	if brandID != nil {
		db = db.Where("products.brand_id = ?", *brandID)
	}

	err := db.
		Preload("Category").
		Preload("Brand").
		Preload("Images").
		Preload("Sizes").
		Preload("Colors").
		Preload("Groups").
		Find(&products).Error

	return products, err
}
