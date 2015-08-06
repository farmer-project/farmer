package git

import "os/exec"

func (g *Git) Clone(repo string, pathSpec string, codeDestination string) error {
	if err := Support(); err != nil {
		return err
	}

	cmd := exec.Command("git", "clone", repo, codeDestination)
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", pathSpec)
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", pathSpec)
	cmd.Stdout = g.OutputStream
	cmd.Stderr = g.ErrorStream
	cmd.Dir = codeDestination
	return cmd.Run()
}
