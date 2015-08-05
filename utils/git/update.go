package git

import "os/exec"

func (g *Git) Update(branch string, codeDestination string) error {
	if err := Support(); err != nil {
		return err
	}

	cmd := exec.Command("git", "reset", "--hard")
	cmd.Stdout = g.Stdout
	cmd.Stderr = g.Stderr
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "master")
	cmd.Stdout = g.Stdout
	cmd.Stderr = g.Stderr
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "checkout", "-B", branch)
	cmd.Stdout = g.Stdout
	cmd.Stderr = g.Stderr
	cmd.Dir = codeDestination
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "pull", "origin", branch)
	cmd.Stdout = g.Stdout
	cmd.Stderr = g.Stderr
	cmd.Dir = codeDestination
	return cmd.Run()
}
