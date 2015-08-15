package controller

import (
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/reverse_proxy"
	"github.com/farmer-project/farmer/db"
)

func DomainAdd(boxName string, url string, port string) error {
	box, err := farmer.FindBoxByName(boxName)
	if err != nil {
		return err
	}

	if err := box.AddDomain(url, port); err != nil {
		return err
	}

	if err := reverse_proxy.ConfigureDomains(box); err != nil {
		return err
	}

	if err := db.DB.Save(&box).Error; err != nil {
		return err
	}

	return reverse_proxy.Restart()
}
