package request

type DeployRequest struct {
	PathSpec string `json:"pathspec" binding:"required"`
}
