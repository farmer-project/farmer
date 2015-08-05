package db

import (
	"os"
	"time"

	"github.com/fsouza/go-dockerclient"
)

const (
	MySQL_SERVER_NAME = "farmer-mysql-server"
	username          = "root"
	password          = "majidGolshadi"
	db_name           = "farmer"
)

func UpServer() *docker.Container {
	d, _ := docker.NewClient(os.Getenv("DOCKER_API"))

	var err error
	DbServer, err = d.InspectContainer(MySQL_SERVER_NAME)

	if err != nil {
		DbServer, _ = d.CreateContainer(mysqlServerConfig())
		// docker need 1 second to create a container
		time.Sleep(time.Second)
		d.StartContainer(DbServer.ID, DbServer.HostConfig)
	}

	return DbServer
}

func mysqlServerConfig() docker.CreateContainerOptions {
	config := &docker.Config{
		Image: "mysql:5.7",
		Env: []string{
			"MYSQL_ROOT_PASSWORD=" + password,
			"MYSQL_DATABASE=" + db_name,
		},
	}
	hostConfig := &docker.HostConfig{
		PublishAllPorts: true,
	}
	return docker.CreateContainerOptions{
		Name:       MySQL_SERVER_NAME,
		Config:     config,
		HostConfig: hostConfig,
	}
}
