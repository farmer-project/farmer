package api

import (
	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/controller"
	"github.com/go-martini/martini"
)

func domainAdd(req request.Domain, params martini.Params) (int, string) {
	if err := controller.DomainAdd(params["name"], req.Url, req.Port); err != nil {
		return 500, err.Error()
	}

	return 204, ""
}

func domainDelete(params martini.Params) (int, string) {
	if err := controller.DomainDelete(params["name"], params["domain"]); err != nil {
		return 500, err.Error()
	}

	return 204, ""
}
