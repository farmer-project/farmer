package controller

import (
	"os"

	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxCreate(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		if err != nil {
			stream.Write([]byte(err.Error()))
		}

		stream.Write([]byte("kthxbai"))
		stream.Close()
	}()

	box := farmer.Box{
		Name:           name,
		OutputStream:   stream,
		ErrorStream:    stream,
		RepoUrl:        repoUrl,
		Pathspec:       pathspec,
		CodeDirectory:  os.Getenv("FARMER_BOX_DATA_LOCATION") + "/" + name,
		CgroupParent:   "level1",
		State:          "creating",
		RevisionNumber: 1,
	}

	if err := db.DB.Save(&box).Error; err != nil {
		return err
	}

	if err := box.Create(); err != nil {
		box.Destroy()
		db.DB.Delete(&box)
		return err
	}

	return db.DB.Save(&box).Error
}
