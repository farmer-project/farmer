package git

import (
	"io"
	"os"
)

type Git struct {
	Stdout io.Writer
	Stderr io.Writer
}

func New() *Git {
	return &Git{
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
}
