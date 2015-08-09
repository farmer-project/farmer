package farmer

import "io"

type Box struct {
	ID   uint   `gorm:"primary_key" json:"-"`
	Name string `sql:"not null;unique" json:"name"`

	InputStream  io.Reader `sql:"-" json:"-"`
	OutputStream io.Writer `sql:"-" json:"-"`
	ErrorStream  io.Writer `sql:"-" json:"-"`

	RepoUrl  string `sql:"type:varchar(255);" json:"repo_url"`
	Pathspec string `sql:"type:varchar(255);not null" json:"pathspec"`

	ContainerID   string `sql:"type:char(64);not null" json:"container_id"`
	Status        string `sql:"type:varchar(255);not null" json:"status"`
	Hostname      string `sql:"-" json:"hostname"`
	CgroupParent  string `sql:"-" json:"cgroupParent"`
	CodeDirectory string `sql:"type:varchar(255);not null" json:"code_directory"`

	FarmerConfig
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

func (b *Box) Destroy() error {
	if err := dockerDeleteContainer(b); err != nil {
		return err
	}

	return b.removeCode()
}
