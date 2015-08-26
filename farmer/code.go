package farmer

import (
	"errors"
	"os"
	"os/exec"
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

func (b *Box) updateCode() error {
	if err := checkCodeConfig(b); err != nil {
		return err
	}

	dir := b.RevisionDirectory()

	cmd := exec.Command("git", "reset", "--hard")
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = dir

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "fetch", "origin")
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = dir

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
