package brain

import (
	"os"

	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/hub"
	"github.com/farmer-project/farmer/utils/farmerFile"
	"github.com/farmer-project/farmer/utils/git"
)

var GREEN_HOUSE = os.Getenv("GREENHOUSE_VOLUME")

// TODO: Add a method to controller that init remotely
func Create(hostname string, repoUrl string, pathspec string, stream *hub.Stream) error {
	defer stream.Close()

	codeDirectory := GREEN_HOUSE + "/" + hostname

	// 1. Clone the code from provided repository and pathspec
	repo := git.New()
	repo.OutputStream = stream
	repo.ErrorStream = stream
	if err := repo.Clone(repoUrl, pathspec, codeDirectory); err != nil {
		return err
	}

	// 2. Read .farmer.yml and parse configuration
	farmerConfig, err := farmerFile.Parse(codeDirectory)
	if err != nil {
		os.RemoveAll(codeDirectory)
		return err
	}

	// 3. Create a box instance
	b := box.New(hostname)
	b.OutputStream = stream
	b.ErrorStream = stream
	b.Git = &box.GitConfig{
		Repo:     repoUrl,
		PathSpec: pathspec,
	}

	// 4. Run box's container
	_, err = b.Run(buildBoxConfiguration(farmerConfig, codeDirectory))
	if err != nil {
		os.RemoveAll(codeDirectory)
		return err
	}

	// 5. Execute post-create script
	cmds := []string{
		"sh",
		"/app/" + farmerConfig.Scripts[farmerFile.SCRIPT_CREATE],
	}

	return b.Exec(cmds)
}

func buildBoxConfiguration(farmerConfig farmerFile.FarmerConfig, codeDirectory string) box.BoxConfig {
	user := "level1"
	network := &box.ContainerNetworkSetting{
		Ports: farmerConfig.Ports,
	}

	return box.BoxConfig{
		Image:        farmerConfig.Image,
		CgroupParent: user,
		Hostname:     user,
		Binds:        []string{codeDirectory + ":/app"}, // Any box has one source code
		Network:      network,
	}
}
