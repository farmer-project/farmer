package box

// TODO: Support multitype container(docker, droplet(digitalocean), ...)
type Box struct {
	Name string `json:"name"`
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
	Binds      []string `json:"volumes"`
	Network      *ContainerNetworkSetting
}

type ContainerNetworkSetting struct {
	Ports []string `json:"ports"`
	Dns   []string `json:"dns"`
}
