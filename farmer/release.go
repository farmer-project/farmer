package farmer

import (
	"errors"
	"github.com/farmer-project/farmer/db"
	"os"
	"strconv"
	"time"
)

type Release struct {
	ID             int    `gorm:"primary_key"`
	ContainerID    string `sql:"type:varchar(64)" json:"container_id"`
	BoxID          int    `sql:"index" json:"-"`
	Box            *Box   `sql:"-" json:"-"`
	CodeDirectory  string `sql:"type:varchar(255);not null" json:"-"`
	ShareDirectory string `sql:"type:varchar(255);not null" json:"-"`
	RepoUrl        string `sql:"type:varchar(255);not null" json:"repo_url"`
	Pathspec       string `sql:"type:varchar(255);not null" json:"pathspec"`
	Type           string `sql:"type:varchar(16)" json:"type"`

	Container
	CreatedAt string `sql:"type:varchar(32);not null" json:"created_at"`
}

type Container struct {
	FarmerConfig
	IP       string `sql:"-" json:"-"`
	Hostname string `sql:"-" json:"hostname"`
}

const (
	ProductionType = "production"
	StagingType    = "staging"
	TestType       = "test"
)

func NewRelease(box *Box, repoUrl string, pathspec string) (Release, error) {
	release := Release{}

	if repoUrl == "" {
		return release, errors.New("RepoUrl is not specified!")
	}

	if pathspec == "" {
		return release, errors.New("Pathspec is not specified!")
	}

	release = Release{
		BoxID:    box.ID,
		Box:      box,
		RepoUrl:  repoUrl,
		Pathspec: pathspec,
	}

	if err := db.DB.Save(&release).Error; err != nil {
		return release, err
	}

	release.setup()

	return release, nil
}

func (r *Release) setup() (err error) {
	r.CodeDirectory = r.Box.Directory + "/" + strconv.Itoa(r.ID)
	r.ShareDirectory = r.Box.sharedDirectory()
	r.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	if err = r.cloneCode(r.Box.OutputStream, r.Box.ErrorStream); err != nil {
		return
	}

	if err = r.parseFarmerfile(); err != nil {
		return
	}

	if r.Box.Production.ID > 0 {
		r.Image, err = dockerCommitContainer(&r.Box.Production, strconv.Itoa(r.ID))
	}

	r.syncSharedWith(r.Box.Production)

	return db.DB.Save(r).Error
}

func (r *Release) changeType(releaseType string) error {
	if releaseType == ProductionType ||
		releaseType == StagingType ||
		releaseType == TestType {
		var err error

		r.Image, err = dockerCommitContainer(r, strconv.Itoa(r.ID)+"-"+releaseType)
		if err != nil {
			return err
		}

		if err = dockerDeleteContainer(r); err != nil {
			return err
		}

		r.Type = releaseType
		return dockerRunContainer(r)
		// TODO: uncomment code below on issue https://github.com/docker/docker/issues/16435 solved
		//		return dockerRenameContainer(r)
	}

	return errors.New("Undefined release type")
}

func (r *Release) runContainer() error {
	return dockerRunContainer(r)
}

func (r *Release) containerName() string {
	switch r.Type {
	case StagingType:
		return r.Box.Name + "-staging"
	case TestType:
		return r.Box.Name + "-test"
	}

	return r.Box.Name
}

func (r *Release) test() (err error) {
	r.Box.Test = Release{
		Box:            r.Box,
		BoxID:          r.BoxID,
		CodeDirectory:  r.CodeDirectory,
		ShareDirectory: r.ShareDirectory,
		RepoUrl:        r.RepoUrl,
		Pathspec:       r.Pathspec,
		Type:           TestType,

		CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}
	r.Box.Test.Hostname = r.Hostname
	r.Box.Test.FarmerConfig = r.FarmerConfig
	r.Box.Test.Image, err = dockerCommitContainer(r, "test-staging"+strconv.Itoa(r.ID))

	if err != nil {
		return
	}

	if err = r.Box.Test.runContainer(); err != nil {
		return
	}

	db.DB.Save(&r.Box.Test)
	r.Box.TestID = r.Box.Test.ID

	return r.Box.Test.runScript(ScriptTest)
}

func (r *Release) Inspect() error {
	return dockerInspectContainer(r)
}

func (r *Release) Destroy(volume bool) error {
	dockerDeleteContainer(r)
	dockerRemoveImage(r.Image)
	if volume {
		os.RemoveAll(r.CodeDirectory)
	}
	return db.DB.Delete(r).Error
}
