package controller

import (
	"os"

	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
	"strconv"
	"time"
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
		UpdateTime:   time.Now().Local().Format("2006-01-02 15:04:05"),
	}
	box.KeepReleases, _ = strconv.Atoi(os.Getenv("FARMER_BOX_KEEP_RELEASES"))

	if err = box.Setup(); err != nil {
		return
	}

	if err = box.Release(repoUrl, pathspec); err != nil {
		println("Error", err.Error())
		// assign domain to test container
	}

	return
}
