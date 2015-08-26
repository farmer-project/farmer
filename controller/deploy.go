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

	box, err := farmer.FindBoxByName(name)
	if err != nil {
		return err
	}

	box.OutputStream = stream
	box.ErrorStream = stream

	cloneBox, err := box.Clone()
	if err != nil {
		return err
	}

	if pathspec != "" {
		cloneBox.Pathspec = pathspec
	}

	if err := cloneBox.Deploy(); err != nil {
		cloneBox.Destroy()
		return err
	}

	if err := cloneBox.Status(); err != nil {
		cloneBox.Destroy()
		return err
	}

	if err := reverse_proxy.ConfigureDomains(cloneBox); err != nil {
		reverse_proxy.ConfigureDomains(box)
		cloneBox.Destroy()
		return err
	}

	reverse_proxy.Restart()
	box.Destroy()

	return db.DB.Save(cloneBox).Error
}
