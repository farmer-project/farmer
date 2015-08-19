package farmer

import "github.com/farmer-project/farmer/db"

func FindBoxByName(name string) (*Box, error) {
	return findBoxBy("name", name)
}

func FindBoxById(id uint) (*Box, error) {
	return findBoxBy("id", id)
}

func findBoxBy(field string, value interface{}) (*Box, error) {
	var err error

	box := &Box{}
	if err = db.DB.Where(field+" = ?", value).Find(box).Error; err != nil {
		return box, err
	}

	box.Inspect()
	if err = db.DB.Model(&box).Related(&box.Domains).Error; err != nil {
		return box, err
	}

	return box, err
}
