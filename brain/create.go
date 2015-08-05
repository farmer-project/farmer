package brain

import (
	"os"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/station"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"github.com/farmer-project/farmer/utils/git"
)

var GREEN_HOUSE = os.Getenv("GREENHOUSE_VOLUME")

// TODO: Add a method to brain that init remotely
func Create(req request.CreateSeedRequest, hub *station.Hub) error {
	defer hub.Close()

	codeDest := GREEN_HOUSE + "/" + req.Name

	// 1. Clone code
	repo := git.New()
	repo.Stdout = hub
	repo.Stderr = hub
	if err := repo.Clone(req.Repo, req.PathSpec, codeDest); err != nil {
		return err
	}

	// 2. Read .farmer.yml and fetch it's data
	ff, err := farmerFile.Parse(codeDest)
	if err != nil {
		os.RemoveAll(codeDest)
		return err
	}

	// 3. Init box configuration
	b := box.New(req.Name)
	b.Stdout = hub
	b.Stderr = hub
	b.Git = &box.GitConfig{
		Repo:     req.Repo,
		PathSpec: req.PathSpec,
	}

	// 4. Create and Start a container
	id, err := b.Run(boxConfigure(ff, codeDest))
	if err != nil {
		os.RemoveAll(codeDest)
		return err
	}

	hub.Write([]byte("Container id: " + id))

	cmds := []string{"sh", "/app/" + ff.Scripts[farmerFile.CREATE]}
	return b.Exec(cmds)
}

func boxConfigure(conf farmerFile.ConfigFile, codeFolderAddress string) box.BoxConfig {
	user := "level1"
	network := &box.ContainerNetworkSetting{
		Ports: conf.Ports,
	}
	return box.BoxConfig{
		Image:        conf.Image,
		CgroupParent: user,
		Hostname:     user,
		Binds:        []string{codeFolderAddress + ":/app"}, // Any container has one source code
		Network:      network,
	}
}
