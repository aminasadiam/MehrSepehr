package repository

import (
	"strings"

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

// GetByID با Preload کامل روابط (شامل Prices جدید)
func (r *ProductRepository) GetByID(id uint, product *models.Product) error {
	return r.db.Preload("Category").
		Preload("Brand").
		Preload("Images").
		Preload("Sizes").
		Preload("Colors").
		Preload("Groups").
		Preload("Prices").
		First(product, id).Error
}

// GetAll با Preload کامل و فیلترهای اختیاری
func (r *ProductRepository) GetAll(products *[]models.Product, filters ...map[string]interface{}) error {
	query := r.db.Preload("Category").
		Preload("Brand").
		Preload("Images").
		Preload("Sizes").
		Preload("Colors").
		Preload("Groups").
		Preload("Prices").
		Order("created_at DESC")

	// اعمال فیلترها اگر مورد نیاز باشد
	if len(filters) > 0 && filters[0] != nil {
		filterMap := filters[0]

		// فیلتر براساس دسته‌بندی
		if categoryID, ok := filterMap["categoryId"]; ok && categoryID != nil {
			query = query.Where("category_id = ?", categoryID)
		}

		// فیلتر براساس برند
		if brandID, ok := filterMap["brandId"]; ok && brandID != nil {
			query = query.Where("brand_id = ?", brandID)
		}

		// جستجو براساس نام یا SKU
		if search, ok := filterMap["search"]; ok && search != nil {
			searchTerm := "%" + strings.ToLower(search.(string)) + "%"
			query = query.Where("LOWER(name) LIKE ? OR LOWER(sku) LIKE ?", searchTerm, searchTerm)
		}
	}

	return query.Find(products).Error
}

func (r *ProductRepository) Update(model *models.Product) error {
	return r.db.Save(model).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *ProductRepository) GetByCategory(categoryID uint) ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("category_id = ?", categoryID).
		Preload("Category").
		Preload("Brand").
		Preload("Images").
		Preload("Sizes").
		Preload("Colors").
		Preload("Groups").
		Preload("Prices").
		Order("created_at DESC").
		Find(&products).Error
	return products, err
}

// Search با Preload کامل (شامل Prices)
func (r *ProductRepository) Search(q string, categoryID *uint, brandID *uint) ([]models.Product, error) {
	var products []models.Product
	db := r.db.Model(&models.Product{}).
		Joins("LEFT JOIN brands ON brands.id = products.brand_id")

	if q != "" {
		like := "%" + strings.ToLower(q) + "%"
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

	err := db.Preload("Category").
		Preload("Brand").
		Preload("Images").
		Preload("Sizes").
		Preload("Colors").
		Preload("Groups").
		Preload("Prices").
		Order("created_at DESC").
		Find(&products).Error

	return products, err
}
