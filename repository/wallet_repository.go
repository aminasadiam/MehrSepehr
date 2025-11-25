package repository

import (
	"github.com/aminasadiam/Kasra/models"
	"gorm.io/gorm"
)

type WalletRepository struct {
	db *gorm.DB
}

func NewWalletRepository(db *gorm.DB) *WalletRepository {
	return &WalletRepository{db: db}
}

func (r *WalletRepository) Create(model *models.Wallet) error {
	return r.db.Create(model).Error
}

func (r *WalletRepository) GetByID(id uint) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Preload("User").First(&wallet, id).Error
	return &wallet, err
}

func (r *WalletRepository) GetByUserID(userID uint) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Where("user_id = ?", userID).Preload("User").First(&wallet).Error
	return &wallet, err
}

func (r *WalletRepository) Update(model *models.Wallet) error {
	return r.db.Save(model).Error
}

func (r *WalletRepository) Delete(id uint) error {
	return r.db.Delete(&models.Wallet{}, id).Error
}

func (r *WalletRepository) AddBalance(userID uint, amount float64) error {
	wallet, err := r.GetByUserID(userID)
	if err != nil {
		return err
	}
	wallet.Balance += amount
	return r.Update(wallet)
}

func (r *WalletRepository) SubtractBalance(userID uint, amount float64) error {
	wallet, err := r.GetByUserID(userID)
	if err != nil {
		return err
	}
	wallet.Balance -= amount
	return r.Update(wallet)
}

