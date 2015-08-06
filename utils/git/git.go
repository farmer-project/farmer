package git

import (
	"io"
	"os"
)

type Git struct {
	OutputStream io.Writer
	ErrorStream io.Writer
}

func New() *Git {
	return &Git{
		OutputStream: os.Stdout,
		ErrorStream: os.Stderr,
	}
}
