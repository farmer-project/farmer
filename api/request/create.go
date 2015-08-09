package request

type CreateRequest struct {
	Name     string `json:"name" binding:"required"`
	RepoUrl  string `json:"repo_url" binding:"required"`
	Pathspec string `json:"pathspec" binding:"required"`
}
