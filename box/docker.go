package box

import (
	"os"

	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/db/tables"
	"github.com/fsouza/go-dockerclient"
)

func (box *Box) Run(config BoxConfig) error {
	container, error := box.Create(config)
	if error != nil {
		return error
	}
	return box.Start(container.ID, container.HostConfig)
}

func (box *Box) Create(config BoxConfig) (*docker.Container, error) {
	d, _ := docker.NewClient(os.Getenv("DOCKER_API"))
	container, err := d.CreateContainer(
		box.createContainerOptions(config),
	)

	if err == nil {
		// improve code if they solve this issue https://github.com/jinzhu/gorm/issues/594
		boxRow := &tables.Box{
			Name:        box.Name,
			Repo:        box.Git.Repo,
			Pathspec:    box.Git.PathSpec,
			ContainerID: container.ID,
		}
		contRow := &tables.Container{
			ID:     container.ID,
			Image:  config.Image,
			Status: "create",
		}

		db.Connect()
		db.DbConnection.Create(boxRow)
		db.DbConnection.Create(contRow)
	}

	return container, err
}

func (box *Box) Start(id string, hostConfig *docker.HostConfig) error {
	d, _ := docker.NewClient(os.Getenv("DOCKER_API"))
	err := d.StartContainer(id, hostConfig)

	if err == nil {
		// improve code style based on this issue solved https://github.com/jinzhu/gorm/issues/595
		db.Connect()
		containerRow := &tables.Container{}
		db.DbConnection.First(containerRow, "id = ?", id)
		db.DbConnection.Model(containerRow).Update(tables.Container{Status: "running"})
	}

	return err
}

func (b *Box) Exec(cmd string) {

}

func (b *Box) createContainerOptions(cfg BoxConfig) docker.CreateContainerOptions {

	dockerConfig := &docker.Config{
		Hostname:     b.Name,
		Image:        cfg.Image,
		ExposedPorts: b.dynamicPortBindings(cfg.Network.Ports),
	}

	dockerHostConfig := &docker.HostConfig{
		Binds:           cfg.Binds,
		CgroupParent:    cfg.CgroupParent,
		PublishAllPorts: true,
	}

	return docker.CreateContainerOptions{
		Name:       b.Name,
		Config:     dockerConfig,
		HostConfig: dockerHostConfig,
	}
}

func (box *Box) dynamicPortBindings(ports []string) map[docker.Port]struct{} {
	portBindings := make(map[docker.Port]struct{})

	for _, portAndProtocol := range ports {
		var pp docker.Port
		pp = docker.Port(portAndProtocol)
		portBindings[pp] = struct{}{}
	}

	return portBindings
}
