package farmer

import (
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/dispatcher"
	"io"
	"os"
)

type Release struct {
	ID    int    `gorm:"primary_key" json:"-"`
	BoxID uint   `sql:"index"`
	Name  string `sql:"not null;unique" json:"name"`
	State string `sql:"type:varchar(255);not null; default:'creating'" json:"state"`

	OutputStream io.Writer `sql:"-" json:"-"`
	ErrorStream  io.Writer `sql:"-" json:"-"`

	CodeDirectory   string `sql:"type:varchar(255);not null" json:"-"`
	SharedDirectory string `sql:"type:varchar(255);not null" json:"-"`
	RepoUrl         string `sql:"type:varchar(255);not null" json:"repo_url"`
	Pathspec        string `sql:"type:varchar(255);not null" json:"pathspec"`

	ContainerID string `sql:"type:char(64);not null" json:"container_id"`
	FarmerConfig
	IP           string `sql:"-" json:"-"`
	Hostname     string `sql:"-" json:"hostname"`
	CgroupParent string `sql:"-" json:"cgroupParent"`
}

const (
	CreatingState = "creating"
	RunningState  = "running"
	TestingState  = "testing"
)

func findReleaseById(id int) (*Release, error) {
	release := &Release{}
	err := db.DB.Where("id = ?", id).Find(release).Error

	return release, err
}

func (r *Release) commitImage() (string, error) {
	return dockerCloneContainerImage(r)
}

func (r *Release) runContainer() error {
	if err := dockerRunContainer(r); err != nil {
		return err
	}

	err := r.makeShared()
	r.setState(RunningState)

	return err
}

func (r *Release) Test() (err error) {
	state := r.State
	defer r.setState(state)

	if err = r.parseFarmerfile(); err != nil {
		return
	}

	r.setState(TestingState)
	testRelease := &Release{
		BoxID: r.BoxID,
		Name:  r.Name + "-test",

		OutputStream: r.OutputStream,
		ErrorStream:  r.ErrorStream,

		CodeDirectory:   r.CodeDirectory,
		SharedDirectory: r.SharedDirectory,
		RepoUrl:         r.RepoUrl,
		Pathspec:        r.Pathspec,

		Hostname:     r.Hostname,
		CgroupParent: r.CgroupParent,
		FarmerConfig: r.FarmerConfig,
	}

	testRelease.Image, err = dockerCloneContainerImage(r)
	if err != nil {
		return
	}

	if err = dockerRunContainer(testRelease); err != nil {
		return
	}

	err = testRelease.runScript(ScriptTest)

	dockerDeleteContainer(testRelease)
	dockerRemoveImage(testRelease.Image)

	return
}

func (r *Release) Inspect() error {
	return dockerInspectContainer(r)
}

func (r *Release) Destroy() error {
	dockerDeleteContainer(r)
	dockerRemoveImage(r.Image)
	os.RemoveAll(r.CodeDirectory)
	return db.DB.Delete(r).Error
}

func (r *Release) setState(state string) {
	r.State = state
	db.DB.Save(r)

	dispatcher.Trigger("release_changed", r)
}
