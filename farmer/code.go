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

	cmd = exec.Command("git", "checkout", b.Pathspec)
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

	cmd = exec.Command("git", "fetch", "origin")
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream
	cmd.Dir = b.CodeDirectory

	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", b.Pathspec)
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

func (b *Box) copyCode(destination string) error {
	cmd := exec.Command("cp", "-rf", b.CodeDirectory, destination)
	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream

	return cmd.Run()
}
