package farmer

import "github.com/farmer-project/farmer/db"

func FetchAllBox() ([]*Box, error) {
	var (
		boxes  []Box
		result []*Box
	)

	if err := db.DB.Find(&boxes).Error; err != nil {
		return []*Box{}, err
	}

	for _, b := range boxes {
		if box, err := FindBoxByName(b.Name); err != nil {
			return []*Box{}, err
		} else {
			result = append(result, box)
		}
	}

	return result, nil
}

func FindBoxByName(name string) (*Box, error) {
	return findBoxBy("name", name)
}

func FindBoxById(id int) (*Box, error) {
	return findBoxBy("id", id)
}

func findBoxBy(field string, value interface{}) (*Box, error) {
	var err error
	box := &Box{}

	if err = db.DB.Where(field+" = ?", value).Find(box).Error; err != nil {
		return box, err
	}
	db.DB.Model(&box).Related(&box.Production, "ProductionID")
	db.DB.Model(&box).Related(&box.Staging, "StagingID")
	db.DB.Model(&box).Related(&box.Test, "TestID")

	box.Production.Box = box
	box.Staging.Box = box
	box.Test.Box = box

	if err = db.DB.Model(&box).Related(&box.Releases).Error; err != nil {
		return box, err
	}

	if err = db.DB.Model(&box).Related(&box.Domains).Error; err != nil {
		return box, err
	}

	if box.Production.ID > 0 {
		box.Production.Inspect()
	}

	if box.Staging.ID > 0 {
		box.Staging.Inspect()
	}

	if box.Test.ID > 0 {
		box.Test.Inspect()
	}

	return box, err
}
