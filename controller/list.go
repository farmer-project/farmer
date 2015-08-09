package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
)

func BoxList() ([]farmer.Box, error) {
	boxes := []farmer.Box{}
	result := db.DB.Find(&boxes)

	return boxes, result.Error
}
