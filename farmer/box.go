package farmer

import (
	"io"
	"os"
	"strconv"

	"errors"
	"github.com/farmer-project/farmer/db"
)

type Box struct {
	ID            uint   `gorm:"primary_key" json:"-"`
	Name          string `sql:"type:varchar(128);not null;unique" json:"name"`
	CodeDirectory string `sql:"type:varchar(255);not null" json:"code_directory"`

	CurrentRelease int        `sql:"type:int; default:0" json:"current"`
	Revision       int        `sql:"type:int; default:0" json:"revision"`
	Releases       []*Release `json:"-"`
	KeepReleases   int        `sql:"type:int; default:1" json:"keep_releases"`

	Domains []Domain `json:"domains"`
}

func (b *Box) Create() error {
	b.Revision = 0
	b.CurrentRelease = 0

	if b.KeepReleases == 0 {
		b.KeepReleases = 1
	}

	if err := os.MkdirAll(b.sharedDirectory(), 0777); err != nil {
		return err
	}

	return db.DB.Save(b).Error
}

func (b *Box) Release(repoUrl string, pathspec string, stream io.Writer) (*Release, error) {
	if repoUrl == "" {
		return &Release{}, errors.New("RepoUrl is not specified!")
	}

	if pathspec == "" {
		return &Release{}, errors.New("Pathspec is not specified!")
	}

	numStr := strconv.Itoa(b.Revision + 1)
	release := &Release{
		BoxID:           b.ID,
		Name:            b.Name + "-rev" + numStr,
		CodeDirectory:   b.CodeDirectory + "/" + numStr,
		SharedDirectory: b.sharedDirectory(),
		RepoUrl:         repoUrl,
		Pathspec:        pathspec,
		OutputStream:    stream,
		ErrorStream:     stream,
	}

	release.cloneCode()
	release.parseFarmerfile()

	if b.Revision > 0 {
		previousRelease, err := findReleaseById(b.CurrentRelease)
		if err != nil {
			return release, err
		}

		release.Image, err = previousRelease.commitImage()
		if err != nil {
			return release, err
		}

		if err = previousRelease.syncShared(release); err != nil {
			return release, err
		}
	}

	if err := release.runContainer(); err != nil {
		release.Destroy()
		return release, err
	}

	scriptTag := ScriptCreate
	if b.CurrentRelease > 0 {
		scriptTag = ScriptDeploy
	}

	if err := release.runScript(scriptTag); err != nil {
		release.Destroy()
		return release, err
	}

	if err := release.Test(); err != nil {
		release.Destroy()
		return release, err
	}

	b.Releases = append(b.Releases, release)
	b.CurrentRelease = release.ID
	b.Revision++

	b.cleanup()

	db.DB.Save(b)

	return release, nil
}

func (b *Box) GetCurrentRelease() (release *Release, err error) {
	if release, err = findReleaseById(b.CurrentRelease); err != nil {
		return
	}

	if err = release.Inspect(); err != nil {
		return
	}

	return
}

func (b *Box) Destroy() error {
	for _, release := range b.Releases {
		release.Destroy()
	}
	os.RemoveAll(b.CodeDirectory)
	return db.DB.Delete(b).Error
}

func (b *Box) cleanup() error {
	if len(b.Releases) > b.KeepReleases {
		selectedRelease := b.Releases[0]
		return selectedRelease.Destroy()
	}

	return nil
}

func (b *Box) sharedDirectory() string {
	return b.CodeDirectory + "/shared"
}
