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

	cmd := exec.Command("git", "clone", b.RepoUrl, b.CodeDirectory)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	return cmd.Run()
}

func (b *Box) updateCode() error {
	if err := checkCodeConfig(b); err != nil {
		return err
	}

	cmd := exec.Command("git", "reset", "--hard")
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "master")
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", b.Pathspec)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	return cmd.Run()
}

func (b *Box) removeCode() error {
	return os.RemoveAll(b.CodeDirectory)
}

func checkCodeConfig(box *Box) error {
	if box.RepoUrl == "" {
		return errors.New("Box repository Url should be set for cloning the code.")
	}

	if box.Pathspec == "" {
		return errors.New("Box pathspec should be set for cloning the code.")
	}

	if box.CodeDirectory == "" {
		return errors.New("Box code destination path should be set for cloning the code.")
	}

	return nil
}