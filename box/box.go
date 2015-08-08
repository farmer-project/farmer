package box

import (
	"io"
	"os"
	"strings"
)

type Box struct {
	Name         string     `json:"name"`
	InputStream  io.Reader  `json:"-"`
	OutputStream io.Writer  `json:"-"`
	ErrorStream  io.Writer  `json:"-"`
	Git          *GitConfig
	Config       *BoxConfig
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
		OutputStream: os.Stdout,
		ErrorStream: os.Stderr,
		InputStream: os.Stdin,
	}
}

func Fetch(identifier string) (*Box, error) {
	box := &Box{}

	c, err := box.inspect(identifier)
	if err != nil {
		return nil, err
	}

	box.Name = strings.TrimLeft(c.Name, "/")
	box.OutputStream = os.Stdout
	box.ErrorStream = os.Stderr
	box.InputStream = os.Stdin
	box.Config = &BoxConfig{
		Image:        c.Image,
		Hostname:     c.Config.Hostname,
		CgroupParent: c.HostConfig.CgroupParent,
		Binds:        c.HostConfig.Binds,
	}

	return box, nil
}

func (b *Box) CodeDirectory() string {
	return strings.Split(b.Config.Binds[0], ":")[0]
}