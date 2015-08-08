package git

import (
	"os/exec"
	"errors"
)

func (g *Git) Update(branch string, codeDestination string) error {
	if err := Support(); err != nil {
		return err
	}

	if branch == "" {
		return errors.New("Branch must be set")
	}

	cmd := exec.Command("git", "reset", "--hard")
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "master")
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", branch)
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", branch)
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	return cmd.Run()
}
