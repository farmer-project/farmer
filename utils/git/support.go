package git
import (
	"errors"
	"os/exec"
)

var ErrorNotInstalled = errors.New("Git command not installed")

func Support() error {
	cmd := exec.Command("git", "help")
	if err := cmd.Start(); err != nil {
		return ErrorNotInstalled
	}
	return nil
}