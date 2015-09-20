package request

import (
	"errors"
	"regexp"
)

type DeployRequest struct {
	RepoUrl  string `json:"repo_url"`
	Pathspec string `json:"pathspec"`
}

func (request *DeployRequest) Validate() error {
	if request.RepoUrl == "" {
		return nil
	}

	if ok, _ := regexp.MatchString("((git|ssh|http(s)?)|(git@[\\w\\.]+))(:(//)?)([\\w\\.@\\:/\\-~]+)(\\.git)(/)?", request.RepoUrl); !ok {
		return errors.New("Invalid git repository URL [" + request.RepoUrl + "]")
	}

	return nil
}
