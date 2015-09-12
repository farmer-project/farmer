package controller

import "github.com/farmer-project/farmer/farmer"

type FarmerBox struct {
	Name     string `json:"name"`
	State    string `json:"state"`
	Image    string `json:"image"`
	RepoUrl  string `json:"repo_url"`
	Pathspec string `json:"pathspec"`
	Revision int    `json:"revision"`
}

func BoxList() ([]FarmerBox, error) {
	var result []FarmerBox

	boxes, _ := farmer.FetchAllBox()
	for _, box := range boxes {
		release, _ := box.GetCurrentRelease()
		result = append(result, FarmerBox{
			Name:     box.Name,
			State:    release.State,
			Image:    release.Image,
			RepoUrl:  release.RepoUrl,
			Pathspec: release.Pathspec,
			Revision: box.Revision,
		})
	}

	return result, nil
}
