package farmer

import (
	"io"
	"os"
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

	Revision int `json:"revision" sql:"default:1"`

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

func (b *Box) Clone() (cloneBox *Box, err error) {
	cloneBox = &Box{
		ID:   b.ID,
		Name: b.Name + "-rev" + strconv.Itoa(b.Revision+1),

		InputStream:  b.InputStream,
		OutputStream: b.OutputStream,
		ErrorStream:  b.ErrorStream,

		RepoUrl:  b.RepoUrl,
		Pathspec: b.Pathspec,

		State:        "creating",
		Hostname:     b.Hostname,
		CgroupParent: b.CgroupParent,

		Revision:     b.Revision,
		FarmerConfig: b.FarmerConfig,
		Domains:      b.Domains,
	}

	b.OutputStream.Write([]byte("Commiting box image..."))

	cloneBox.Image, err = dockerCloneContainerImage(b)
	if err != nil {
		return
	}

	b.OutputStream.Write([]byte("Done\n"))

	cloneBox.CodeDirectory = os.Getenv("FARMER_BOX_DATA_LOCATION") + "/" + cloneBox.Name

	b.copyCode(cloneBox.CodeDirectory)

	if err = dockerRunContainer(cloneBox); err != nil {
		os.RemoveAll(cloneBox.CodeDirectory)
		dockerRemoveImage(cloneBox.Image)

		return
	}

	return
}

func (b *Box) Destroy() error {
	dockerDeleteContainer(b)
	dockerRemoveImage(b.Image)
	return b.removeCode()
}

func (b *Box) Restart() error {
	return dockerRestartContainer(b)
}
