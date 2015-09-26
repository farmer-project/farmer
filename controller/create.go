package controller

import (
	"os"
	"strconv"
	"time"

	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxCreate(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		stream.Close(err)
	}()

	box := farmer.Box{
		Name:         name,
		Directory:    os.Getenv("FARMER_BOX_DATA_LOCATION") + "/" + name,
		OutputStream: stream,
		ErrorStream:  stream,
		UpdateTime:   time.Now().Local().Format(farmer.TimeFormat),
	}
	box.KeepReleases, _ = strconv.Atoi(os.Getenv("FARMER_BOX_KEEP_RELEASES"))

	if err = box.Setup(); err != nil {
		return
	}

	if err = box.Release(repoUrl, pathspec); err != nil {
		return
	}

	return
}
