package controller

import (
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/reverse_proxy"
)

func BoxDestroy(name string) (err error) {
	box, err := farmer.FindBoxByName(name)

	if err != nil {
		return err
	}

	if err := reverse_proxy.DeleteDomains(box); err != nil {
		return err
	}

	return box.Destroy()
}
