package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxDeploy(name string, pathspec string, stream *hub.Stream) error {
	box, err := farmer.FindBoxByName(name)

	if err != nil {
		return err
	}

	box.OutputStream = stream
	box.ErrorStream = stream
	box.Pathspec = pathspec

	if err := box.Deploy(); err != nil {
		return err
	}

	return db.DB.Save(box).Error
}
