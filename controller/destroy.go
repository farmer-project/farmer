package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
)

func BoxDestroy(name string) error {
	box, err := farmer.FindBoxByName(name)

	if err != nil {
		return err
	}

	if err := box.Destroy(); err != nil {
		return err
	}

	return db.DB.Delete(box).Error
}
