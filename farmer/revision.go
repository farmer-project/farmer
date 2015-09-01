package farmer

import "strconv"

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

	if err = newBox.cloneCode(); err != nil {
		return
	}

	if err = newBox.parseFarmerfile(); err != nil {
		return
	}

	b.OutputStream.Write(
		[]byte("Commiting box image from revision #" + strconv.Itoa(b.RevisionNumber) + " to revision #" + strconv.Itoa(newBox.RevisionNumber) + "..."),
	)

	newBox.Image, err = dockerCloneContainerImage(b)
	if err != nil {
		return
	}

	b.OutputStream.Write([]byte("Done\n"))

	if err = newBox.syncShared(b); err != nil {
		return
	}

	if err = dockerRunContainer(newBox); err != nil {
		return
	}

	if err = newBox.runScript(SCRIPT_DEPLOY); err != nil {
		return
	}

	if err = newBox.makeShared(); err != nil {
		return
	}

	if err = newBox.Test(); err != nil {
		return
	}

	return
}

func (b *Box) DestroyRevision() error {
	dockerDeleteContainer(b)
	dockerRemoveImage(b.Image)
	return b.removeCode()
}
