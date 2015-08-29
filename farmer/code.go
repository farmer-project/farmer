package farmer

import (
	"errors"
	"os"
	"os/exec"
	"path"
)

func (b *Box) cloneCode() error {
	if err := checkCodeConfig(b); err != nil {
		return err
	}

	dir := b.RevisionDirectory()

	cmd := exec.Command("git", "clone", b.RepoUrl, dir)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = dir

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = dir

	return cmd.Run()
}

func (b *Box) makeShared() error {
	if err := b.setupShared(); err != nil {
		return err
	}

	return b.linkShared()
}

func (b *Box) setupShared() error {
	os.Mkdir(b.SharedDirectory(), 0777)

	for _, asset := range b.Shared {
		shared := b.RevisionDirectory() + "/" + asset
		dest := b.SharedDirectory() + "/" + asset

		os.MkdirAll(path.Dir(dest), 0777)

		_, err := os.Stat(dest)
		if os.IsNotExist(err) {
			cmd := exec.Command("mv", shared, dest)
			cmd.Stdout = b.OutputStream
			cmd.Stderr = b.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}
	}

	return nil
}

func (b *Box) linkShared() error {
	for _, dir := range b.Shared {
		dest := b.RevisionDirectory() + "/" + dir
		shared := b.SharedDirectory() + "/" + dir

		os.RemoveAll(dest)

		cmd := exec.Command("ln", "-s", shared, dest)
		cmd.Stdout = b.OutputStream
		cmd.Stderr = b.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}
	}

	return nil
}

func (b *Box) removeCode() error {
	return os.RemoveAll(b.RevisionDirectory())
}

func checkCodeConfig(box *Box) error {
	if box.RepoUrl == "" {
		return errors.New("Box repository Url must be set when cloning the code.")
	}

	if box.Pathspec == "" {
		return errors.New("Box pathspec must be set when cloning the code.")
	}

	if box.CodeDirectory == "" {
		return errors.New("Box code destination path must be set when cloning the code.")
	}

	return nil
}
