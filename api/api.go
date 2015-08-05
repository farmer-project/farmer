package api

import (
	"net/http"

	"github.com/farmer-project/farmer/api/request"
	"github.com/go-martini/martini"
	"github.com/martini-contrib/binding"
)

type FarmerApi struct {
	Port string
}

func (farmer *FarmerApi) Listen() {
	server := martini.Classic()

	server.Use(farmer.jsonRequest)
	farmer.registerRoutes(server)

	server.RunOnAddr(":" + farmer.Port)
}

func (farmer *FarmerApi) registerRoutes(server *martini.ClassicMartini) {
	server.Get("/box/list", farmer.listSeed)
	server.Get("/box/:box/inspect", farmer.inspectSeed)
	server.Get("/box/:box/backup/list", farmer.seedBoxBackupList)
	server.Get("/box/:box/domain/list", farmer.listDomain)

	server.Post(
		"/box/create",
		binding.Bind(request.CreateSeedRequest{}),
		farmer.createSeed,
	)
	server.Post("/box/deploy", farmer.deployOnSeed)
	server.Post("/box/backup/create", farmer.backUpSeedBoxVolumes)
	server.Post("/box/domain/add", farmer.addDomain)

	server.Delete("/box/delete", farmer.deleteSeed)
	server.Delete("/box/backup/delete/:tag", farmer.restoreSeedBoxVolumes)
	server.Delete("/box/domain/delete", farmer.deleteDomain)
}

func (farmer *FarmerApi) jsonRequest(res http.ResponseWriter, req *http.Request) {
	if req.Header.Get("Content-Type") != "application/json" {
		res.WriteHeader(http.StatusBadRequest)
		res.Header().Set("Content-Type", "application/json")
		res.Write([]byte("{'error':'Content-Type specified must be application/json')}"))
	}
}
