package git
import (
	"os"
	"io"
)

type Git struct {
	Repo string
	Stdout io.Writer
	Stderr io.Writer
}

func New(repo string) *Git {
	return &Git{
		Repo: repo,
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
}
