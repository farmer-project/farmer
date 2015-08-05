package brain

import (
	"os"
	"strings"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/station"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"github.com/farmer-project/farmer/utils/git"
)

func Deploy(req request.DeploySeedRequest, hub *station.Hub) error {
	b, _ := box.Fetch(req.Name)
	codeDest := strings.Split(b.Config.Binds[0], ":")[0]

	repo := git.New()
	repo.Stdout = hub
	repo.Stderr = hub
	if err := repo.Update(req.PathSpec, codeDest); err != nil {
		return err
	}

	ff, err := farmerFile.Parse(codeDest)
	if err != nil {
		os.RemoveAll(codeDest)
		return err
	}

	cmds := []string{"sh", "/app/" + ff.Scripts[farmerFile.DEPLOY]}
	b.Stdout = hub
	b.Stderr = hub
	return b.Exec(cmds)
}
