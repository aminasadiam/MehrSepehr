package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(model *models.Category) error {
	return r.db.Create(model).Error
}

func (r *CategoryRepository) GetByID(id uint) (*models.Category, error) {
	var category models.Category
	err := r.db.Preload("Products").First(&category, id).Error
	return &category, err
}

func (r *CategoryRepository) GetAll() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Preload("Products").Find(&categories).Error
	return categories, err
}

func (r *CategoryRepository) Update(model *models.Category) error {
	return r.db.Save(model).Error
}

func (r *CategoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.Category{}, id).Error
}

func (r *CategoryRepository) GetBySlug(slug string) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("slug = ?", slug).Preload("Products").First(&category).Error
	return &category, err
}

func (r *CategoryRepository) GetByIDWithChildren(id uint, category *models.Category) error {
	return r.db.Preload("Children").Preload("Products").First(category, id).Error
}

func (r *CategoryRepository) GetAllWithChildren(categories *[]models.Category) error {
	return r.db.Preload("Children", func(db *gorm.DB) *gorm.DB {
		return db.Order("name")
	}).Preload("Products").Order("name").Find(categories).Error
}
