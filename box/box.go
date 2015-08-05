package box
import (
	"io"
	"os"
)

// TODO: Support multitype container(docker, droplet(digitalocean), ...)
type Box struct {
	Name string `json:"name"`
	Stdout io.Writer
	Stderr io.Writer
	Git  *GitConfig
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
		Name: name,
		Stderr: os.Stderr,
		Stdout: os.Stdout,
	}
}
