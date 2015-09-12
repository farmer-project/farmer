package controller

import (
	"errors"

	"github.com/farmer-project/farmer/dispatcher"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
)

func BoxDeploy(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		if err != nil {
			stream.Write([]byte(err.Error()))
		}

		stream.Close()
	}()

	box, err := farmer.FindBoxByName(name)
	if err != nil {
		return errors.New("Cannot find box '" + name + "'")
	}

	release, _ := box.GetCurrentRelease()
	if release.State == farmer.TestingState {
		return errors.New("Box '" + name + "' is in deploying progress!")
	}

	if release.RepoUrl == "" {
		repoUrl = release.RepoUrl
	}

	if release.Pathspec == "" {
		pathspec = release.Pathspec
	}

	if _, err = box.Release(repoUrl, pathspec, stream); err != nil {
		return
	}

	dispatcher.Trigger("new_release", box)
	return
}
