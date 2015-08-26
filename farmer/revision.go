package farmer

import (
	"os/exec"
	"strconv"
)

func (b *Box) Revision() (newBox *Box, err error) {
	newBox = &Box{
		ID:   b.ID,
		Name: b.Name,

		InputStream:  b.InputStream,
		OutputStream: b.OutputStream,
		ErrorStream:  b.ErrorStream,

		RepoUrl:  b.RepoUrl,
		Pathspec: b.Pathspec,

		State:        "revisioning",
		Hostname:     b.Hostname,
		CgroupParent: b.CgroupParent,

		RevisionNumber: b.RevisionNumber + 1,
		FarmerConfig:   b.FarmerConfig,
		Domains:        b.Domains,
		CodeDirectory:  b.CodeDirectory,
	}

	b.OutputStream.Write(
		[]byte("Commiting box image from revision #" + strconv.Itoa(b.RevisionNumber) + " to revision #" + strconv.Itoa(newBox.RevisionNumber) + "..."),
	)

	newBox.Image, err = dockerCloneContainerImage(b)
	if err != nil {
		return
	}

	b.OutputStream.Write([]byte("Done\n"))

	b.copyCode(newBox)

	if err = dockerRunContainer(newBox); err != nil {
		return
	}

	if err = newBox.Deploy(); err != nil {
		return
	}

	if err = newBox.Status(); err != nil {
		return
	}

	return
}

func (b *Box) copyCode(destBox *Box) error {
	cmd := exec.Command(
		"cp",
		"-rf",
		b.RevisionDirectory(),
		destBox.RevisionDirectory(),
	)

	cmd.Stdout = b.OutputStream
	cmd.Stderr = b.ErrorStream

	return cmd.Run()
}
