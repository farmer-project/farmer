package request

type (
	CreateSeedRequest struct {
		Name      string          `json:"name" binding:"required"`
		Repo      string          `json:"repo" binding:"required"`
		PathSpec  string          `json:"pathspec" binding:"required"`
	}
)
