package brain

import "github.com/farmer-project/farmer/box"

func Delete(name string) error {
	box, err := box.Fetch(name)
	if err != nil {
		return err
	}

	return box.Delete(true)
}
