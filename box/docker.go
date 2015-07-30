package box

import (
	"os"

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
	return d.CreateContainer(
		box.createContainerOptions(config),
	)
}

func (box *Box) Start(id string, hostConfig *docker.HostConfig) error {
	d, _ := docker.NewClient(os.Getenv("DOCKER_API"))
	return d.StartContainer(id, hostConfig)
}

func (b *Box) Exec(cmd string) {

}

func (b *Box) createContainerOptions(cfg BoxConfig) docker.CreateContainerOptions {

	dockerConfig := &docker.Config{
		Hostname: b.Name,
		Image:    cfg.Image,
		ExposedPorts: b.dynamicPortBindings(cfg.Network.Ports),
	}

	dockerHostConfig := &docker.HostConfig{
		Binds:        cfg.Binds,
		CgroupParent: cfg.CgroupParent,
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

	for _,portAndProtocol := range ports {
		var pp docker.Port
		pp = docker.Port(portAndProtocol)
		portBindings[pp] = struct{}{}
	}

	return portBindings
}
