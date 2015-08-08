package hub

import (
	"os"
	"time"

	"github.com/fsouza/go-dockerclient"
	"github.com/farmer-project/farmer/box"
	"github.com/farmer-project/farmer/utils/network"
)

const (
	RABBITMQ_STATION_NAME = "farmer-rabbitmq-station"
	AMDIN_AMQP_SERVER     = "ADMIN_AMQP_SERVER"
	AMQP_SERVER_IP        = "AMQP_SERVER_IP"

	username              = "admin"
	password              = "admin"
)

func SetupServer() *docker.Container {
	ds := os.Getenv("DOCKER_API")
	d, _ := docker.NewClient(ds)

	station, error := d.InspectContainer(RABBITMQ_STATION_NAME)
	if error != nil {
		station, _ = d.CreateContainer(stationConfig())
		// docker need 1 second to create a container
		time.Sleep(time.Second)
		d.StartContainer(station.ID, station.HostConfig)
		station, _ = d.InspectContainer(RABBITMQ_STATION_NAME)
	}
	// TODO: Assign domain to station dashboard and station server

	os.Setenv(AMDIN_AMQP_SERVER, "amqp://"+username+":"+password+"@"+station.NetworkSettings.IPAddress+":5672/")
	os.Setenv(AMQP_SERVER_IP, dockerServerIp(ds)+":"+box.PublicPort(station, "5672/tcp")+"/")

	return station
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

func dockerServerIp(ds string) string {
	ip := network.FetchIp(ds)
	if ip == "127.0.0.1" {
		ip, _ = network.ExternalIP()
	}

	return ip
}
