package api

import (
	"net/http"

	"github.com/farmer-project/farmer/api/request"
	"github.com/go-martini/martini"
	"github.com/martini-contrib/binding"
)

type Api struct {
	Port string
}

func (api *Api) Listen() {
	server := martini.Classic()

	server.Use(api.jsonRequest)
	api.registerRoutes(server)

	server.RunOnAddr(":" + api.Port)
}

func (api *Api) registerRoutes(server *martini.ClassicMartini) {

	// Box routes
	server.Post("/box", binding.Bind(request.CreateRequest{}), api.boxCreate)
	server.Put("/box/:hostname", binding.Bind(request.DeployRequest{}), api.boxDeploy)
	server.Get("/box", api.boxList)
	server.Get("/box/:hostname", api.boxInspect)
	server.Delete("/box/:hostname", api.boxDelete)

	// Domain routes
	server.Post("/box/:hostname/domain", api.domainAdd)
	server.Delete("/box/:hostname/domain/:domain", api.domainDelete)
}

func (api *Api) jsonRequest(res http.ResponseWriter, req *http.Request) {
	if req.Header.Get("Content-Type") != "application/json" {
		res.WriteHeader(http.StatusBadRequest)
		res.Header().Set("Content-Type", "application/json")
		res.Write([]byte("{'error':'Content-Type specified must be application/json')}"))
	}
}
