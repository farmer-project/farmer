package reverse_proxy

import (
	"github.com/fsouza/go-dockerclient"
	"os"
)

var dockerClient *docker.Client

func init() {
	dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))
}

func Restart() error {
	return dockerClient.RestartContainer("farmer-reverse-proxy", 1)
}
