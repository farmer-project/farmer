package controller

import (
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/reverse_proxy"
)

func DomainAdd(boxName string, url string, port string) error {
	box, err := farmer.FindBoxByName(boxName)
	if err != nil {
		return err
	}

	if err := reverse_proxy.AddDomain(box, url, port); err != nil {
		return err
	}

	return reverse_proxy.Restart()
}

func DomainDelete(boxName string, url string) error {
	box, err := farmer.FindBoxByName(boxName)
	if err != nil {
		return err
	}

	if err := reverse_proxy.DeleteDomain(box, url); err != nil {
		return err
	}

	return reverse_proxy.Restart()
}
