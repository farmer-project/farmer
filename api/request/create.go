package request

type CreateRequest struct {
	Name     string `json:"name" binding:"required"`
	RepoUrl  string `json:"repo_url" binding:"required"`
	PathSpec string `json:"pathspec" binding:"required"`
}
