package controller

import (
	"os"

	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxCreate(name string, repoUrl string, pathspec string, stream *hub.Stream) error {
	defer stream.Close()

	box := farmer.Box{
		Name:          name,
		OutputStream:  stream,
		ErrorStream:   stream,
		RepoUrl:       repoUrl,
		Pathspec:      pathspec,
		CodeDirectory: os.Getenv("FARMER_FARMLAND_DIRECTORY") + "/" + name,
		CgroupParent:  "level1",
	}

	err := db.DB.Save(&box).Error
	if err != nil {
		return err
	}

	err = box.Create()

	if err != nil {
		db.DB.Delete(&box)
		return err
	}

	return db.DB.Save(&box).Error
}
