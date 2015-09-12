package controller

import (
	"os"

	"errors"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
	"strconv"
)

func BoxCreate(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		if err != nil {
			stream.Write([]byte(err.Error()))
		}

		stream.Close()
	}()

	if existBox, _ := farmer.FindBoxByName(name); existBox.Name == name {
		return errors.New("Duplicate box name '" + name + "'")
	}

	kr, _ := strconv.Atoi(os.Getenv("FARMER_BOX_KEEP_RELEASES"))
	box := farmer.Box{
		Name:          name,
		CodeDirectory: os.Getenv("FARMER_BOX_DATA_LOCATION") + "/" + name,
		KeepReleases:  kr,
	}

	if err = box.Create(); err != nil {
		box.Destroy()
	}

	if _, err = box.Release(repoUrl, pathspec, stream); err != nil {
		box.Destroy()
		return
	}

	return nil
}
