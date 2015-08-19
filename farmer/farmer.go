package farmer

import "github.com/farmer-project/farmer/db"

func FindBoxByName(name string) (*Box, error) {
	box := &Box{}
	var err error
	if err = db.DB.Where("name = ?", name).Find(box).Error; err != nil {
		return box, err
	}

	box.Inspect()
	if err = db.DB.Model(&box).Related(&box.Domains).Error; err != nil {
		return box, err
	}

	return box, err
}
