package farmer

import (
	"errors"
	"os"
	"os/exec"
	"path"
)

func (r *Release) cloneCode() error {
	if err := checkCodeConfig(r); err != nil {
		return err
	}

	dir := r.CodeDirectory

	cmd := exec.Command("git", "clone", r.RepoUrl, dir)
	cmd.Stdout = r.OutputStream
	cmd.Stderr = r.ErrorStream

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", r.Pathspec)
	cmd.Stdout = r.OutputStream
	cmd.Stderr = r.ErrorStream
	cmd.Dir = dir

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", r.Pathspec)
	cmd.Stdout = r.OutputStream
	cmd.Stderr = r.ErrorStream
	cmd.Dir = dir

	return cmd.Run()
}

func (r *Release) syncShared(srcRelease *Release) error {
	for _, asset := range r.Shared {
		var assetPath string

		srcAssetPath := srcRelease.CodeDirectory + "/" + asset
		ownAssetPath := r.CodeDirectory + "/" + asset

		if exists(srcAssetPath) {
			assetPath = srcAssetPath
		} else {
			assetPath = ownAssetPath
		}

		sharedRealPath := srcRelease.SharedDirectory + "/" + asset

		if !exists(sharedRealPath) && exists(assetPath) {
			os.MkdirAll(path.Dir(sharedRealPath), 0777)

			cmd := exec.Command("mv", assetPath, path.Dir(sharedRealPath)+"/")
			cmd.Stdout = r.OutputStream
			cmd.Stderr = r.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}

		cmd := exec.Command("rm", "-rf", ownAssetPath)
		cmd.Stdout = r.OutputStream
		cmd.Stderr = r.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}

		os.MkdirAll(path.Dir(ownAssetPath), 0777)
		cmd = exec.Command("ln", "-s", "/shared/"+asset, ownAssetPath)
		cmd.Stdout = r.OutputStream
		cmd.Stderr = r.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}

		cmd = exec.Command("rm", "-rf", srcAssetPath)
		cmd.Stdout = r.OutputStream
		cmd.Stderr = r.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}

		os.MkdirAll(path.Dir(srcAssetPath), 0777)
		cmd = exec.Command("ln", "-s", "/shared/"+asset, srcAssetPath)
		cmd.Stdout = r.OutputStream
		cmd.Stderr = r.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}
	}

	return nil
}

func (r *Release) makeShared() error {
	if err := r.setupShared(); err != nil {
		return err
	}

	return r.linkShared()
}

func (r *Release) setupShared() error {
	os.Mkdir(r.SharedDirectory, 0777)

	for _, asset := range r.Shared {
		assetPath := r.CodeDirectory + "/" + asset
		sharedRealPath := r.SharedDirectory + "/" + asset

		if !exists(sharedRealPath) {
			if exists(assetPath) {
				os.MkdirAll(path.Dir(sharedRealPath), 0777)

				cmd := exec.Command("mv", assetPath, path.Dir(sharedRealPath)+"/")
				cmd.Stdout = r.OutputStream
				cmd.Stderr = r.ErrorStream
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

func (r *Release) linkShared() error {
	for _, asset := range r.Shared {
		destRealPath := r.CodeDirectory + "/" + asset

		os.RemoveAll(destRealPath)

		cmd := exec.Command("ln", "-s", "/shared/"+asset, destRealPath)
		cmd.Stdout = r.OutputStream
		cmd.Stderr = r.ErrorStream
		if err := cmd.Run(); err != nil {
			return err
		}
	}

	return nil
}

func (r *Release) removeCode() error {
	return os.RemoveAll(r.CodeDirectory)
}

func checkCodeConfig(release *Release) error {
	if release.RepoUrl == "" {
		return errors.New("Box repository Url must be set when cloning the code.")
	}

	if release.Pathspec == "" {
		return errors.New("Box pathspec must be set when cloning the code.")
	}

	if release.CodeDirectory == "" {
		return errors.New("Box code destination path must be set when cloning the code.")
	}

	return nil
}

func exists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
