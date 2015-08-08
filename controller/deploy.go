package controller

import (
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/hub"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"github.com/farmer-project/farmer/utils/git"
)

func Deploy(hostname string, pathspec string, stream *hub.Stream) error {
	b, _ := box.Fetch(hostname)
	codeDirectory := b.CodeDirectory()

	repo := git.New()
	repo.OutputStream = stream
	repo.ErrorStream = stream
	if err := repo.Update(pathspec, codeDirectory); err != nil {
		return err
	}

	ff, err := farmerFile.Parse(codeDirectory)
	if err != nil {
		return err
	}

	cmds := []string{
		"sh",
		"/app/" + ff.Scripts[farmerFile.SCRIPT_DEPLOY],
	}

	b.OutputStream = stream
	b.ErrorStream = stream

	return b.Exec(cmds)
}
