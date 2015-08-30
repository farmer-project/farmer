package farmer

import (
	"errors"
	"github.com/fsouza/go-dockerclient"
	"os"
	"strconv"
	"strings"
)

var dockerClient *docker.Client

func init() {
	dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))
}

func dockerCreateContainer(box *Box) error {
	//dockerPullImage(box)

	container, err := dockerClient.CreateContainer(
		dockerCreateContainerOptions(box),
	)

	if err != nil {
		return err
	}

	box.ContainerID = container.ID
	return dockerInspectContainer(box)
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
	box.State = dockerTranslateContainerState(container.State)

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

	if err := dockerStartContainer(box); err != nil {
		dockerClient.RemoveContainer(docker.RemoveContainerOptions{
			ID:            box.ContainerID,
			RemoveVolumes: true,
		})

		return err
	}

	return nil
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

	err = dockerClient.StartExec(exec.ID, docker.StartExecOptions{
		Detach:       false,
		Tty:          false,
		OutputStream: box.OutputStream,
		ErrorStream:  box.ErrorStream,
	})

	if err != nil {
		return err
	}

	inspectExec, err := dockerClient.InspectExec(exec.ID)
	if err != nil {
		return err
	}

	if inspectExec.ExitCode != 0 {
		return errors.New("Exited with code " + strconv.Itoa(inspectExec.ExitCode))
	}

	return nil
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
		Env:          box.Env,
	}

	dockerHostConfig := &docker.HostConfig{
		Binds:           []string{
			box.RevisionDirectory() + ":" + box.Home,
			box.SharedDirectory() + ":/shared",
		},
		CgroupParent:    box.CgroupParent,
		PublishAllPorts: true,
	}

	return docker.CreateContainerOptions{
		Name:       box.Name + "-rev" + strconv.Itoa(box.RevisionNumber),
		Config:     dockerConfig,
		HostConfig: dockerHostConfig,
	}
}

func dockerPullImage(box *Box) error {
	repository := strings.Split(box.Image, ":")[0]
	tag := "latest"
	if s := strings.Split(box.Image, ":"); len(s) > 1 {
		tag = s[1]
	}

	return dockerClient.PullImage(docker.PullImageOptions{
		OutputStream: box.OutputStream,
		Repository:   repository,
		Tag:          tag,
	}, docker.AuthConfiguration{})
}

func dockerCloneContainerImage(box *Box) (string, error) {
	revisionNumber := strconv.Itoa(box.RevisionNumber + 1)

	_, err := dockerClient.CommitContainer(docker.CommitContainerOptions{
		Container:  box.ContainerID,
		Repository: box.Name,
		Tag:        revisionNumber,
	})

	if err != nil {
		return "", err
	}

	return box.Name + ":" + revisionNumber, nil
}

func dockerRemoveImage(image string) error {
	return dockerClient.RemoveImage(image)
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
