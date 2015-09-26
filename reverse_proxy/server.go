package reverse_proxy

import (
	"os"

	"github.com/fsouza/go-dockerclient"
)

var dockerClient *docker.Client

func init() {
	dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))
}

func Restart() error {
	return dockerClient.RestartContainer("farmer-reverse-proxy", 1)
}
