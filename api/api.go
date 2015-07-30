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
	server.Get("/seed/list", farmer.listSeed)
	server.Get("/seed/:seed/inspect", farmer.inspectSeed)
	server.Get("/seed/:seed/backup/list", farmer.seedBoxBackupList)
	server.Get("/seed/:seed/domain/list", farmer.listDomain)

	server.Post(
		"/seed/create",
		binding.Bind(request.CreateSeedRequest{}),
		farmer.createSeed,
	)
	server.Post("/seed/deploy", farmer.deployOnSeed)
	server.Post("/seed/backup/create", farmer.backUpSeedBoxVolumes)
	server.Post("/seed/domain/add", farmer.addDomain)

	server.Delete("/seed/delete", farmer.deleteSeed)
	server.Delete("/seed/backup/delete/:tag", farmer.restoreSeedBoxVolumes)
	server.Delete("/seed/domain/delete", farmer.deleteDomain)
}

func (farmer *FarmerApi) jsonRequest(res http.ResponseWriter, req *http.Request) {
	if req.Header.Get("Content-Type") != "application/json" {
		res.WriteHeader(http.StatusBadRequest)
		res.Header().Set("Content-Type", "application/json")
		res.Write([]byte("{'error':'Content-Type specified must be application/json')}"))
	}
}
