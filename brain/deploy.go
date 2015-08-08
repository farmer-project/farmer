package brain

import (
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/hub"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"github.com/farmer-project/farmer/utils/git"
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/db/models"
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

	db.Connect()
	boxRow := &models.Box{}
	db.DbConnection.First(boxRow, "name = ?", hostname)
	db.DbConnection.Model(boxRow).Update(models.Box{Pathspec: pathspec})

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
