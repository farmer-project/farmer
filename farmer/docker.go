package farmer

import (
	"github.com/fsouza/go-dockerclient"
	"os"
)

var dockerClient *docker.Client

func init() {
	dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))
}

func dockerCreateContainer(box *Box) error {
	container, err := dockerClient.CreateContainer(
		dockerCreateContainerOptions(box),
	)

	if err != nil {
		return err
	}

	box.ContainerID = container.ID
	dockerInspectContainer(box)

	return err
}

func dockerInspectContainer(box *Box) error {
	container, err := dockerClient.InspectContainer(box.ContainerID)

	if err != nil {
		return err
	}

	box.Hostname = container.Config.Hostname
	box.CgroupParent = container.HostConfig.CgroupParent
	box.Image = container.Config.Image
	box.IP = container.NetworkSettings.IPAddress

	box.Ports = dockerExtractPortBindings(container.NetworkSettings.Ports)
	box.Status = dockerTranslateContainerState(container.State)

	return nil
}

func dockerStartContainer(box *Box) error {
	err := dockerClient.StartContainer(box.ContainerID, dockerCreateContainerOptions(box).HostConfig)

	if err != nil {
		return err
	}

	return dockerInspectContainer(box)
}

func dockerRunContainer(box *Box) error {
	if err := dockerCreateContainer(box); err != nil {
		return err
	}

	return dockerStartContainer(box)
}

func dockerExecOnContainer(box *Box, commands []string) error {
	exec, err := dockerClient.CreateExec(docker.CreateExecOptions{
		Container:    box.ContainerID,
		AttachStdin:  false,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          false,
		Cmd:          commands,
	})

	if err != nil {
		return err
	}

	return dockerClient.StartExec(exec.ID, docker.StartExecOptions{
		Detach:       false,
		Tty:          false,
		OutputStream: box.OutputStream,
		ErrorStream:  box.ErrorStream,
	})
}

func dockerDeleteContainer(box *Box) error {
	return dockerClient.RemoveContainer(docker.RemoveContainerOptions{
		ID:            box.ContainerID,
		RemoveVolumes: false,
		Force:         true,
	})
}

func dockerRestartContainer(box *Box) error {
	return dockerClient.RestartContainer(box.ContainerID, 1)
}

func dockerCreateContainerOptions(box *Box) docker.CreateContainerOptions {
	dockerConfig := &docker.Config{
		Hostname:     box.Name,
		Image:        box.Image,
		ExposedPorts: dockerReversePortBindings(box.Ports),
		Env: 		  box.Env,
	}

	dockerHostConfig := &docker.HostConfig{
		Binds:           []string{box.CodeDirectory + ":/app"},
		CgroupParent:    box.CgroupParent,
		PublishAllPorts: true,
	}

	return docker.CreateContainerOptions{
		Name:       box.Name,
		Config:     dockerConfig,
		HostConfig: dockerHostConfig,
	}
}

func dockerReversePortBindings(ports []string) map[docker.Port]struct{} {
	portBindings := make(map[docker.Port]struct{})

	for _, portAndProtocol := range ports {
		var pp docker.Port
		pp = docker.Port(portAndProtocol)
		portBindings[pp] = struct{}{}
	}

	return portBindings
}

func dockerExtractPortBindings(ports map[docker.Port][]docker.PortBinding) []string {
	var portBindings []string
	for port, _ := range ports {
		portBindings = append(portBindings, string(port))
	}

	return portBindings
}

func dockerTranslateContainerState(state docker.State) string {
	switch {
	case state.Running:
		return "running"

	case state.Paused:
		return "paused"

	case state.Restarting:
		return "restarting"

	default:
		return "created"
	}
}
