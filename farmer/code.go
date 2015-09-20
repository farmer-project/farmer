package farmer

import (
	"errors"
	"io"
	"os"
	"os/exec"
	"path"
)

func (r *Release) cloneCode(outputStream io.Writer, errorStream io.Writer) error {
	if err := checkCodeConfig(r); err != nil {
		return err
	}

	dir := r.CodeDirectory

	cmd := exec.Command("git", "clone", r.RepoUrl, dir)
	cmd.Stdout = outputStream
	cmd.Stderr = errorStream

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", r.Pathspec)
	cmd.Stdout = outputStream
	cmd.Stderr = errorStream
	cmd.Dir = dir

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", r.Pathspec)
	cmd.Stdout = outputStream
	cmd.Stderr = errorStream
	cmd.Dir = dir

	return cmd.Run()
}

func (r *Release) syncSharedWith(srcRelease Release) error {
	if r.CodeDirectory == "" || srcRelease.CodeDirectory == "" {
		return errors.New("Release configuration error (code directory)")
	}

	for _, asset := range r.Shared {
		var srcFile string
		var duplicateFile string

		srcAssetPath := srcRelease.CodeDirectory + "/" + asset
		destAssetPath := r.CodeDirectory + "/" + asset

		sharedRealPath := r.Box.sharedDirectory() + "/" + asset

		if !exists(sharedRealPath) {

			if exists(srcAssetPath) {
				srcFile = srcAssetPath
				duplicateFile = destAssetPath
			} else {
				srcFile = destAssetPath
				duplicateFile = srcAssetPath
			}

			os.MkdirAll(path.Dir(sharedRealPath), 0777)

		} else {
			duplicateFile = destAssetPath
		}

		if srcFile != "" && exists(srcFile) {
			cmd := exec.Command("mv", srcFile, path.Dir(sharedRealPath)+"/")
			cmd.Stdout = r.Box.OutputStream
			cmd.Stderr = r.Box.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}

		if duplicateFile != "" && exists(duplicateFile) {
			cmd := exec.Command("rm", "-rf", duplicateFile)
			cmd.Stdout = r.Box.OutputStream
			cmd.Stderr = r.Box.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}

		if srcFile != "" && !exists(srcFile) {
			os.MkdirAll(path.Dir(srcFile), 0777)
			cmd := exec.Command("ln", "-s", "/shared/"+asset, srcFile)
			cmd.Stdout = r.Box.OutputStream
			cmd.Stderr = r.Box.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
		}

		if duplicateFile != "" && !exists(duplicateFile) {
			os.MkdirAll(path.Dir(duplicateFile), 0777)
			cmd := exec.Command("ln", "-s", "/shared/"+asset, duplicateFile)
			cmd.Stdout = r.Box.OutputStream
			cmd.Stderr = r.Box.ErrorStream
			if err := cmd.Run(); err != nil {
				return err
			}
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
	os.Mkdir(r.ShareDirectory, 0777)

	for _, asset := range r.Shared {
		assetPath := r.CodeDirectory + "/" + asset
		sharedRealPath := r.ShareDirectory + "/" + asset

		if !exists(sharedRealPath) {
			if exists(assetPath) {
				os.MkdirAll(path.Dir(sharedRealPath), 0777)

				cmd := exec.Command("mv", assetPath, path.Dir(sharedRealPath)+"/")
				cmd.Stdout = r.Box.OutputStream
				cmd.Stderr = r.Box.ErrorStream
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
		cmd.Stdout = r.Box.OutputStream
		cmd.Stderr = r.Box.ErrorStream
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
