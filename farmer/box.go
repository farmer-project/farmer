package farmer

import (
	"errors"
	"io"
	"os"
	"time"

	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/dispatcher"
)

type Box struct {
	ID        int    `gorm:"primary_key"`
	Name      string `sql:"type:varchar(64);" json:"name"`
	Directory string `sql:"type:varchar(255);not null" json:"directory"`
	State     string `sql:"type:varchar(32);not null; default:'creating'" json:"state"`
	Revision  int    `sql:"default:0" json:"revision"`

	OutputStream io.Writer `sql:"-" json:"-"`
	ErrorStream  io.Writer `sql:"-" json:"-"`

	ProductionID int
	Production   Release
	StagingID    int
	Staging      Release
	TestID       int
	Test         Release
	KeepReleases int       `sql:"default:1" json:"keep_releases"`
	Releases     []Release `json:"-"`

	Domains []Domain `json:"domains"`

	UpdateTime string `sql:"type:char(64);not null" json:"update_time"`
}

const (
	CreatedState = "create"
	RunningState = "running"
	StagingState = "staging"
)

func (b *Box) sharedDirectory() string {
	return b.Directory + "/shared"
}

// Create box basement
func (b *Box) Setup() error {
	if b.Name == "" {
		return errors.New("Name field is empty")
	}

	box := &Box{}
	if db.DB.Where("name = ?", b.Name).Find(box); box.Name == b.Name {
		return errors.New("Duplicate box name")
	}

	if b.Directory == "" {
		return errors.New("Code directory field is empty")
	}

	if b.KeepReleases == 0 {
		b.KeepReleases = 1
	}

	if err := os.MkdirAll(b.sharedDirectory(), 0777); err != nil {
		return err
	}

	return b.SetState(CreatedState)
}

func (b *Box) Release(repoUrl string, pathspec string) error {
	defer db.DB.Save(b)

	b.publish("Make new release")
	release, err := NewRelease(b, repoUrl, pathspec)
	if err != nil {
		return err
	}

	b.publish("Created release to stage")
	if err := b.stage(release); err != nil {
		return err
	}

	b.publish("Test on staging release")
	if err := b.Staging.test(); err != nil {
		dispatcher.Trigger("test_release_failed", b)
		return err
	}

	b.publish("Move staging to production")
	if err := b.deploy(); err != nil {
		return err
	}

	b.publish("Cleanup old releases")
	if err := b.cleanup(); err != nil {
		return err
	}

	b.UpdateTime = time.Now().Local().Format(TimeFormat)
	return nil
}

func (b *Box) stage(release Release) error {
	defer func() {
		b.StagingID = release.ID
		b.Staging = release
		b.SetState(RunningState)
	}()

	b.SetState(StagingState)
	release.Type = StagingType

	script := ScriptCreate
	if b.Revision > 0 {
		script = ScriptDeploy
	}

	if err := release.runContainer(); err != nil {
		return err
	}

	if err := release.runScript(script); err != nil {
		return err
	}

	return release.makeShared()
}

func (b *Box) deploy() error {
	if err := b.Test.Destroy(false); err != nil {
		return err
	}
	b.TestID = 0
	b.Test = Release{}

	if b.Production.ID > 0 {
		b.Production.Destroy(false)
	}

	b.ProductionID = b.Staging.ID
	b.Production = b.Staging
	if err := b.Production.changeType(ProductionType); err != nil {
		return err
	}

	b.Releases = append(b.Releases, b.Production)
	b.Revision++

	b.StagingID = 0
	b.Staging = Release{}

	return b.SetState(RunningState)
}

func (b *Box) SetState(state string) error {
	b.State = state
	err := db.DB.Save(b).Error

	dispatcher.Trigger("box_changed", b)

	return err
}

func (b *Box) cleanup() error {
	if len(b.Releases) > b.KeepReleases {
		selectedRelease := b.Releases[0]
		return selectedRelease.Destroy(true)
	}

	return nil
}

func (b *Box) publish(message string) {
	b.OutputStream.Write([]byte(FarmerPreMessage + message + "\n"))
}

func (b *Box) Destroy() error {
	for _, release := range b.Releases {
		release.Destroy(true)
	}
	os.RemoveAll(b.Directory)
	return db.DB.Delete(b).Error
}
