package api
import "github.com/go-martini/martini"


func (f* FarmerApi) addDomain(params martini.Params) string {
	return "Hi"
}

func (f* FarmerApi) deleteDomain(params martini.Params) string {
	return "Hi"
}

func (f* FarmerApi) listDomain(params martini.Params) string {
	return params["seedbox"]
}
