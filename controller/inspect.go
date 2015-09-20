package controller

import "github.com/farmer-project/farmer/farmer"

type BoxInspection struct {
	Name     string          `json:"name"`
	State    string          `json:"state"`
	Image    string          `json:"image"`
	RepoUrl  string          `json:"repo_url"`
	Pathspec string          `json:"pathspec"`
	Home     string          `json:"home"`
	Ports    []string        `json:"ports"`
	Domains  []farmer.Domain `json:"domains"`
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
		Image:    box.Production.Image,
		RepoUrl:  box.Production.RepoUrl,
		Pathspec: box.Production.Pathspec,
		Home:     box.Production.Home,
		Ports:    box.Production.Ports,
		Domains:  box.Domains,
		UpdateAt: box.Production.CreatedAt,
	}, nil
}
