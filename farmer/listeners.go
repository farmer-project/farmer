package farmer

import (
	"os"

	"github.com/fsouza/go-dockerclient"

	"github.com/farmer-project/farmer/dispatcher"
)

func init() {
	dispatcher.On("test_release_failed", func(payload interface{}) {
		if box, ok := payload.(*Box); ok {
			dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))

			box.OutputStream.Write([]byte("Test FAILED \n\r"))
			box.OutputStream.Write([]byte("you can access to your test container on these ports: \n\r"))
			testCont, _ := dockerClient.InspectContainer(box.Test.ContainerID)
			for port, portBinding := range testCont.NetworkSettings.Ports {
				box.OutputStream.Write([]byte(" - " + string(port) + "->" + portBinding[0].HostPort + "\n"))
			}
		}
	})
}
