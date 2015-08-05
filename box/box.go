package box

import (
	"io"
	"os"
)

// TODO: Support multitype container(docker, droplet(digitalocean), ...)
type Box struct {
	Name   string `json:"name"`
	Stdout io.Writer
	Stderr io.Writer
	Git    *GitConfig
	Config *BoxConfig
}

type GitConfig struct {
	Repo     string `json:"repo"`
	PathSpec string `json:"pathspec"`
}

type BoxConfig struct {
	Image        string   `json:"image"`
	Hostname     string   `json:"hostname"`
	CgroupParent string   `json:"cgroupParent"`
	Binds        []string `json:"volumes"`
	Network      *ContainerNetworkSetting
}

type ContainerNetworkSetting struct {
	Ports []string `json:"ports"`
	Dns   []string `json:"dns"`
}

func New(name string) *Box {
	return &Box{
		Name:   name,
		Stderr: os.Stderr,
		Stdout: os.Stdout,
	}
}

func Fetch(identifier string) (*Box, error) {
	box := &Box{}

	con, err := box.inspect(identifier)
	if err != nil {
		return nil, err
	}

	box.Name = con.Name
	box.Stdout = os.Stdout
	box.Stderr = os.Stderr
	box.Config = &BoxConfig{
		Image:        con.Image,
		Hostname:     con.Config.Hostname,
		CgroupParent: con.HostConfig.CgroupParent,
		Binds:        con.HostConfig.Binds,
	}

	return box, nil
}
