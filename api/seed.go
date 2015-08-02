package api

import (
	"net/http"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/brain"
	"github.com/go-martini/martini"
)

// POST
func (f *FarmerApi) createSeed(res http.ResponseWriter, req request.CreateSeedRequest) string {
	return brain.Create(req).Error()
}

// POST
func (f *FarmerApi) deployOnSeed(params martini.Params) string {
	return "Hi"
}

// DELETE
func (f *FarmerApi) deleteSeed(params martini.Params) string {
	return "Hi"
}

// POST
func (f *FarmerApi) runCommandOnSeed(params martini.Params) string {
	return "Hi"
}

// GET
func (f *FarmerApi) listSeed() string {
	return "Hi"
}

// GET
func (f *FarmerApi) inspectSeed(params martini.Params) string {
	return params["seedbox"]
}
