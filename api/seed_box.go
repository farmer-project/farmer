package api
import "github.com/go-martini/martini"

// POST
func (f* FarmerApi) createSeedBox(params martini.Params) string {
	return "Hi"
}

// POST
func (f* FarmerApi) deployOnSeedBox(params martini.Params) string {
	return "Hi"
}

// DELETE
func (f* FarmerApi) deleteSeedBox(params martini.Params) string {
	return "Hi"
}

// POST
func (f* FarmerApi) runCommandOnSeedBox(params martini.Params) string {
	return "Hi"
}

// GET
func (f* FarmerApi) listSeedBox() string {
	return "Hi"
}

// GET
func (f* FarmerApi) inspectSeedBox(params martini.Params) string {
	return params["seedbox"]
}
