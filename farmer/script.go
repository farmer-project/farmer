package farmer

const (
	ScriptCreate = "create"
	ScriptDeploy = "deploy"
	ScriptTest   = "test"
)

func (r *Release) runScript(key string) error {
	if _, ok := r.Scripts[key]; ok {
		return dockerExecOnContainer(r, []string{
			r.Home + "/" + r.Scripts[key],
		})
	}

	return nil
}
