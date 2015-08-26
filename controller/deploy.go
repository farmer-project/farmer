package controller

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
	"github.com/farmer-project/farmer/reverse_proxy"
)

func BoxDeploy(name string, pathspec string, stream *hub.Stream) (err error) {
	defer func() {
		if err != nil {
			stream.Write([]byte(err.Error()))
		}

		stream.Write([]byte("kthxbai"))
		stream.Close()
	}()

	oldBox, err := farmer.FindBoxByName(name)
	if err != nil {
		return err
	}

	if pathspec != "" {
		oldBox.Pathspec = pathspec
	}

	oldBox.OutputStream = stream
	oldBox.ErrorStream = stream

	updatedBox, err := oldBox.Revision()
	if err != nil {
		updatedBox.Destroy()
		return err
	}

	if err := reverse_proxy.ConfigureDomains(updatedBox); err != nil {
		updatedBox.Destroy()
		reverse_proxy.ConfigureDomains(oldBox)
		return err
	}

	reverse_proxy.Restart()
	oldBox.Destroy()

	return db.DB.Save(updatedBox).Error
}
