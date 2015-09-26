package request

import (
	"errors"
	"regexp"
)

type CreateRequest struct {
	Name     string `json:"name" binding:"required"`
	RepoUrl  string `json:"repo_url" binding:"required"`
	Pathspec string `json:"pathspec" binding:"required"`
}

func (request *CreateRequest) Validate() error {
	if len(request.Name) > 127 {
		return errors.New("Too long name length [Maximum 128 char]")
	}

	if ok, _ := regexp.MatchString("[a-zA-Z0-9_-]+", request.Name); !ok {
		return errors.New("Invalid Name [" + request.Name + "]")
	}

	if ok, _ := regexp.MatchString("((git|ssh|http(s)?)|(git@[\\w\\.]+))(:(//)?)([\\w\\.@\\:/\\-~]+)(\\.git)(/)?", request.RepoUrl); !ok {
		return errors.New("Invalid git repository URL [" + request.RepoUrl + "]")
	}

	return nil
}
