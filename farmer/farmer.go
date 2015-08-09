package farmer

import "github.com/farmer-project/farmer/db"

func FindBoxByName(name string) (*Box, error) {
	box := &Box{}
	err := db.DB.Find(box).Where("name = ?", name).Error

	box.Inspect()

	return box, err
}
