package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/reverse_proxy"
)

func BoxDestroy(name string) error {
	box, err := farmer.FindBoxByName(name)

	if err != nil {
		return err
	}

	if err := reverse_proxy.DeleteDomains(box); err != nil {
		return err
	}

	if err := box.Destroy(); err != nil {
		return err
	}

	return db.DB.Delete(box).Error
}
