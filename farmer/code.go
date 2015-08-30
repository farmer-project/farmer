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

func (b *Box) syncShared(srcBox *Box) error {
	for _, asset := range b.Shared {
		var assetPath string

		srcAssetPath := srcBox.RevisionDirectory() + "/" + asset
		ownAssetPath := b.RevisionDirectory() + "/" + asset

		if exists(srcAssetPath) {
			assetPath = srcAssetPath
		} else {
			assetPath = ownAssetPath
		}

		sharedRealPath := b.SharedDirectory() + "/" + asset

		if !exists(sharedRealPath) && exists(assetPath) {
			os.MkdirAll(path.Dir(sharedRealPath), 0777)

			cmd := exec.Command("mv", assetPath, path.Dir(sharedRealPath)+"/")
			cmd.Stdout = b.OutputStream
			cmd.Stderr = b.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}

			cmd = exec.Command("ln", "-s", "/shared/"+asset, assetPath)
			cmd.Stdout = b.OutputStream
			cmd.Stderr = b.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}
	}

	return nil
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
		assetPath := b.RevisionDirectory() + "/" + asset
		sharedRealPath := b.SharedDirectory() + "/" + asset

		if !exists(sharedRealPath) {
			if exists(assetPath) {
				os.MkdirAll(path.Dir(sharedRealPath), 0777)

				cmd := exec.Command("mv", assetPath, path.Dir(sharedRealPath)+"/")
				cmd.Stdout = b.OutputStream
				cmd.Stderr = b.ErrorStream
				if err := cmd.Run(); err != nil {
					return err
				}
			} else {
				return errors.New("Shared asset '" + assetPath + "' should exist in source code.")
			}
		}
	}

	return nil
}

func (b *Box) linkShared() error {
	for _, asset := range b.Shared {
		destRealPath := b.RevisionDirectory() + "/" + asset

		os.RemoveAll(destRealPath)

		cmd := exec.Command("ln", "-s", "/shared/"+asset, destRealPath)
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

func exists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
