package controller

import (
	"strconv"

	"github.com/farmer-project/farmer/farmer"
)

type BoxInspection struct {
	Name     string          `json:"name"`
	State    string          `json:"state"`
	RepoUrl  string          `json:"repo_url"`
	Pathspec string          `json:"pathspec"`
	Home     string          `json:"home"`
	Ports    []string        `json:"ports"`
	Domains  []farmer.Domain `json:"domains"`
	Revision string          `json:"revision"`
	UpdateAt string          `json:"update_at"`
}

func BoxInspect(boxName string) (BoxInspection, error) {
	box, err := farmer.FindBoxByName(boxName)
	if err != nil {
		return BoxInspection{}, err
	}

	return BoxInspection{
		Name:     box.Name,
		State:    box.State,
		RepoUrl:  box.Production.RepoUrl,
		Pathspec: box.Production.Pathspec,
		Home:     box.Production.Home,
		Ports:    box.Production.Ports,
		Domains:  box.Domains,
		Revision: strconv.Itoa(box.Revision),
		UpdateAt: box.Production.CreatedAt,
	}, nil
}
