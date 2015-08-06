package request

type CreateRequest struct {
	Hostname string `json:"hostname" binding:"required"`
	RepoUrl  string `json:"repo_url" binding:"required"`
	PathSpec string `json:"pathspec" binding:"required"`
}
