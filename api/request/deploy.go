package request

type DeployRequest struct {
	Pathspec string `json:"pathspec" binding:"required"`
}
