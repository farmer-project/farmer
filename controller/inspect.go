package controller

import "github.com/farmer-project/farmer/farmer"

func BoxInspect(boxName string) (*farmer.Release, error) {
	box, err := farmer.FindBoxByName(boxName)
	if err != nil {
		return &farmer.Release{}, err
	}

	return box.GetCurrentRelease()
}
