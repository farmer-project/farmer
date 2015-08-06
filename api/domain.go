package api

import "github.com/go-martini/martini"

func (api *Api) domainAdd(params martini.Params) string {
	return "Hi"
}

func (api *Api) domainDelete(params martini.Params) string {
	return "Hi"
}

func (api *Api) domainList(params martini.Params) string {
	return params["seedbox"]
}
