package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
	"github.com/farmer-project/farmer/reverse_proxy"
)

func BoxDeploy(name string, repoUrl string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		if err != nil {
			stream.Write([]byte(err.Error()))
		}

		stream.Write([]byte("kthxbai"))
		stream.Close()
	}()

	currentBox, err := farmer.FindBoxByName(name)
	if err != nil {
		return err
	}

	if pathspec != "" {
		currentBox.Pathspec = pathspec
	}

	if repoUrl != "" {
		currentBox.RepoUrl = repoUrl
	}

	currentBox.OutputStream = stream
	currentBox.ErrorStream = stream

	updatedBox, err := currentBox.Revision()
	if err != nil {
		updatedBox.DestroyRevision()
		return err
	}

	if err := reverse_proxy.ConfigureDomains(updatedBox); err != nil {
		updatedBox.DestroyRevision()
		reverse_proxy.ConfigureDomains(currentBox)
		return err
	}

	reverse_proxy.Restart()
	currentBox.DestroyRevision()

	return db.DB.Save(updatedBox).Error
}
