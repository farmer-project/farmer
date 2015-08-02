package station

import (
	"os"

	"github.com/fsouza/go-dockerclient"
	"time"
)

const (
	RABBITMQ_STATION_NAME = "farmer-rabbitmq-station"
	username              = "admin"
	password              = "5h1Eq2Majid][GolshadiFarmer<3#"
)

var Station docker.Container

func UpServer() *docker.Container {
	d, _ := docker.NewClient(os.Getenv("DOCKER_API"))

	Station, error := d.InspectContainer(RABBITMQ_STATION_NAME)
	if error != nil {
		Station, _ = d.CreateContainer(stationConfig())
		// docker need 1 second to create a container
		time.Sleep(time.Second)
		d.StartContainer(Station.ID, Station.HostConfig)
	}
	// TODO: Assign domain to station dashboard and station server

	return Station
}

func stationConfig() docker.CreateContainerOptions {
	config := &docker.Config{
		Image: "tutum/rabbitmq",
		Env:   []string{"RABBITMQ_PASS=" + password},
	}
	hostConfig := &docker.HostConfig{
		PublishAllPorts: true,
	}
	return docker.CreateContainerOptions{
		Name:       RABBITMQ_STATION_NAME,
		Config:     config,
		HostConfig: hostConfig,
	}
}
