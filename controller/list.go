package controller

import "github.com/farmer-project/farmer/farmer"

type FarmerBox struct {
	Name     string `json:"name"`
	State    string `json:"state"`
	RepoUrl  string `json:"repo_url"`
	Pathspec string `json:"pathspec"`
	UpdateAt string `json:"update_at"`
}

func BoxList() ([]FarmerBox, error) {
	var result []FarmerBox

	boxes, _ := farmer.FetchAllBox()
	for _, box := range boxes {
		result = append(result, FarmerBox{
			Name:     box.Name,
			State:    box.State,
			RepoUrl:  box.Production.RepoUrl,
			Pathspec: box.Production.Pathspec,
			UpdateAt: box.UpdateTime,
		})
	}

	return result, nil
}
