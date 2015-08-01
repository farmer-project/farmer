package git

import (
	"os/exec"
	"os"
)

func Clone(repo string, pathSpec string, codeDestination string) error {
	if err := Support(); err != nil {
		return err
	}

	cmd := exec.Command("git", "clone", repo, codeDestination)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command("git", "checkout", "-B", pathSpec)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = codeDestination
	cmd.Run()

	cmd = exec.Command("git", "pull", "origin", pathSpec)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = codeDestination
	cmd.Run()

	return nil
}
