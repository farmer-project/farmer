package request

type DeploySeedRequest struct {
	Name     string `json:"name" binding:"required"`
	PathSpec string `json:"pathspec" binding:"required"`
}
