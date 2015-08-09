package farmer

const (
	SCRIPT_CREATE = "create"
	SCRIPT_DEPLOY = "deploy"
)

func (b *Box) runScript(key string) error {
	if _, ok := b.Scripts[key]; ok {
		return dockerExecOnContainer(b, []string{
			"sh",
			"/app/" + b.Scripts[key],
		})
	}

	return nil
}
