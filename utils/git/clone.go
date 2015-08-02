package git

import (
	"os"
	"os/exec"
)

func Clone(repo string, pathSpec string, codeDestination string) error {
	if err := Support(); err != nil {
		return err
	}

	cmd := exec.Command("git", "clone", repo, codeDestination)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", pathSpec)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", pathSpec)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	return nil
}
