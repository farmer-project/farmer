package controller

import (
	"errors"

	"github.com/farmer-project/farmer/dispatcher"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxDeploy(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		stream.Close(err)
	}()

	box, err := farmer.FindBoxByName(name)
	if err != nil {
		return errors.New("Cannot find box '" + name + "'")
	}

	if box.State == farmer.StagingState {
		return errors.New("Box '" + name + "' is in Staging progress!")
	}

	box.OutputStream = stream
	box.ErrorStream = stream

	if repoUrl == "" {
		repoUrl = box.Production.RepoUrl
	}

	if pathspec == "" {
		pathspec = box.Production.Pathspec
	}

	if err = box.Release(repoUrl, pathspec); err != nil {
		return
	}

	dispatcher.Trigger("new_release", box)
	return nil
}
