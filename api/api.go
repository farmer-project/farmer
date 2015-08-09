package api

import (
	"net/http"
	"os"

	"github.com/farmer-project/farmer/api/request"
	"github.com/go-martini/martini"
	"github.com/martini-contrib/binding"
)

func Listen() {
	server := martini.Classic()

	server.Use(jsonRequest)
	registerRoutes(server)

	server.RunOnAddr(":" + os.Getenv("FARMER_API_PORT"))
}

func registerRoutes(server *martini.ClassicMartini) {
	// Box
	server.Post("/boxes", binding.Bind(request.CreateRequest{}), boxCreate)
	server.Put("/boxes/:name", binding.Bind(request.DeployRequest{}), boxDeploy)
	server.Get("/boxes", boxList)
	server.Get("/boxes/:name", boxInspect)
	server.Delete("/boxes/:name", boxDelete)

	// Domain
	server.Post("/boxes/:name/domain", domainAdd)
	server.Delete("/boxes/:name/domain/:domain", domainDelete)
}

func jsonRequest(res http.ResponseWriter, req *http.Request) {
	if req.Header.Get("Content-Type") != "application/json" {
		res.WriteHeader(http.StatusBadRequest)
		res.Header().Set("Content-Type", "application/json")
		res.Write([]byte("{'error':'Content-Type specified must be application/json')}"))
	}
}
