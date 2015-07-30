package brain

import (
	"os"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"fmt"
)

var GREEN_HOUSE = os.Getenv("GREENHOUSE_VOLUME")

// TODO: Add a method to brain that init remotely
func Create(req request.CreateSeedRequest) {
	// 1. Clone code(ahmad work)
	// 2. Read .farmer.yml (done)
	// 3. Parse file and fetch it's data (done)
	// 4. Init box configuration
	// 5. Create an container
	projectConfig, err := farmerFile.Parse(GREEN_HOUSE)

	if  err != nil {
		panic(err)
//		file does not exists and remove cloned code
	}

	box := box.Box{
		Name: req.Name,
		Git: &box.GitConfig {
			Repo: req.Repo,
			PathSpec: req.PathSpec,
		},
	}
fmt.Println(boxConfigure(projectConfig, GREEN_HOUSE))
	box.Run(boxConfigure(projectConfig, GREEN_HOUSE))
}

func boxConfigure(conf farmerFile.ConfigFile, codeFolderAddress string) box.BoxConfig {
	user := "level1"
	network := &box.ContainerNetworkSetting{
		Ports: conf.Ports,
	}
	return box.BoxConfig{
		Image: conf.Image,
		CgroupParent: user,
		Hostname: user,
		Binds: []string{"/app:"+codeFolderAddress}, // Any container has one source code
		Network: network,
	}
}
