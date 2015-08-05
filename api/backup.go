package api

import "github.com/go-martini/martini"

// POST
func (f *FarmerApi) backUpSeedBoxVolumes(params martini.Params) string {
	return "Hi"
}

// POST
func (f *FarmerApi) restoreSeedBoxVolumes(params martini.Params) string {
	return "Hi"
}

// GET
func (f *FarmerApi) seedBoxBackupList(params martini.Params) string {
	return params["seedbox"]
}
