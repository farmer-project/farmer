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

func dockerCreateContainer(release *Release) error {
	//dockerPullImage(box)

	options := dockerCreateContainerOptions(release)
	dockerEnsureVolumes(options.HostConfig)

	container, err := dockerClient.CreateContainer(options)
	if err != nil {
		return err
	}

	release.ContainerID = container.ID

	return dockerInspectContainer(release)
}

func dockerInspectContainer(release *Release) error {
	container, err := dockerClient.InspectContainer(release.ContainerID)

	if err != nil {
		return err
	}

	release.Hostname = container.Config.Hostname
	release.CgroupParent = container.HostConfig.CgroupParent
	release.Image = container.Config.Image
	release.IP = container.NetworkSettings.IPAddress

	release.Ports = dockerExtractPortBindings(container.NetworkSettings.Ports)
	release.State = dockerTranslateContainerState(container.State)

	return nil
}

func dockerStartContainer(release *Release) error {
	err := dockerClient.StartContainer(release.ContainerID, dockerCreateContainerOptions(release).HostConfig)

	if err != nil {
		return err
	}

	return dockerInspectContainer(release)
}

func dockerRunContainer(release *Release) error {
	if err := dockerCreateContainer(release); err != nil {
		return err
	}

	if err := dockerStartContainer(release); err != nil {
		dockerClient.RemoveContainer(docker.RemoveContainerOptions{
			ID:            release.ContainerID,
			RemoveVolumes: true,
		})

		return err
	}

	return nil
}

func dockerExecOnContainer(release *Release, commands []string) error {
	exec, err := dockerClient.CreateExec(docker.CreateExecOptions{
		Container:    release.ContainerID,
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
		OutputStream: release.OutputStream,
		ErrorStream:  release.ErrorStream,
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

func dockerDeleteContainer(release *Release) error {
	return dockerClient.RemoveContainer(docker.RemoveContainerOptions{
		ID:            release.ContainerID,
		RemoveVolumes: false,
		Force:         true,
	})
}

func dockerRestartContainer(release *Release) error {
	return dockerClient.RestartContainer(release.ContainerID, 1)
}

func dockerCreateContainerOptions(release *Release) docker.CreateContainerOptions {
	dockerConfig := &docker.Config{
		Hostname:     release.Name,
		Image:        release.Image,
		ExposedPorts: dockerReversePortBindings(release.Ports),
		Env:          release.Env,
	}

	dockerHostConfig := &docker.HostConfig{
		Binds: []string{
			release.CodeDirectory + ":" + release.Home,
			release.SharedDirectory + ":/shared",
		},
		CgroupParent:    release.CgroupParent,
		PublishAllPorts: true,
	}

	return docker.CreateContainerOptions{
		Name:       release.Name,
		Config:     dockerConfig,
		HostConfig: dockerHostConfig,
	}
}

func dockerPullImage(release *Release) error {
	repository := strings.Split(release.Image, ":")[0]
	tag := "latest"
	if s := strings.Split(release.Image, ":"); len(s) > 1 {
		tag = s[1]
	}

	return dockerClient.PullImage(docker.PullImageOptions{
		OutputStream: release.OutputStream,
		Repository:   repository,
		Tag:          tag,
	}, docker.AuthConfiguration{})
}

func dockerCloneContainerImage(release *Release) (string, error) {
	_, err := dockerClient.CommitContainer(docker.CommitContainerOptions{
		Container:  release.ContainerID,
		Repository: release.Name,
	})

	if err != nil {
		return "", err
	}

	return release.Name, nil
}

func dockerEnsureVolumes(hostConfig *docker.HostConfig) {
	for _, binding := range hostConfig.Binds {
		paths := strings.Split(binding, ":")
		os.MkdirAll(paths[0], 0777)
	}
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
