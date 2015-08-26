package farmer

import (
	"io"
	"strconv"
)

type Box struct {
	ID   uint   `gorm:"primary_key" json:"-"`
	Name string `sql:"not null;unique" json:"name"`

	InputStream  io.Reader `sql:"-" json:"-"`
	OutputStream io.Writer `sql:"-" json:"-"`
	ErrorStream  io.Writer `sql:"-" json:"-"`

	RepoUrl  string `sql:"type:varchar(255);" json:"repo_url"`
	Pathspec string `sql:"type:varchar(255);not null" json:"pathspec"`

	ContainerID   string `sql:"type:char(64);not null" json:"container_id"`
	State         string `sql:"type:varchar(255);not null; default:'creating'" json:"state"`
	Hostname      string `sql:"-" json:"hostname"`
	CgroupParent  string `sql:"-" json:"cgroupParent"`
	CodeDirectory string `sql:"type:varchar(255);not null" json:"code_directory"`
	IP            string `sql:"-" json:"-"`

	RevisionNumber int `json:"revision" sql:"default:1"`

	FarmerConfig
	Domains []Domain `json:"domains"`
}

func (b *Box) Create() error {
	if err := b.cloneCode(); err != nil {
		return err
	}

	if err := b.parseFarmerfile(); err != nil {
		return err
	}

	if err := dockerRunContainer(b); err != nil {
		return err
	}

	return b.runScript(SCRIPT_CREATE)
}

func (b *Box) Inspect() error {
	return dockerInspectContainer(b)
}

func (b *Box) Deploy() error {
	if err := b.updateCode(); err != nil {
		return err
	}

	if err := b.parseFarmerfile(); err != nil {
		return err
	}

	return b.runScript(SCRIPT_DEPLOY)
}

func (b *Box) Status() error {
	if err := b.parseFarmerfile(); err != nil {
		return err
	}

	return b.runScript(SCRIPT_STATUS)
}

func (b *Box) Destroy() error {
	dockerDeleteContainer(b)
	dockerRemoveImage(b.Image)
	return b.removeCode()
}

func (b *Box) Restart() error {
	return dockerRestartContainer(b)
}

func (b *Box) RevisionDirectory() string {
	return b.CodeDirectory + "/" + strconv.Itoa(b.RevisionNumber)
}