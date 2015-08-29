package request

type DeployRequest struct {
	RepoUrl  string `json:"repo_url"`
	Pathspec string `json:"pathspec"`
}
