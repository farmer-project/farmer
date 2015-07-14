package api

import (
	"github.com/go-martini/martini"
)

type FarmerApi struct {
	port string
}

func (farmer *FarmerApi) start() {
	server := martini.Classic()
	server.Get("/seedbox/list",						farmer.ListSeedBox)
	server.Get("/seedbox/:seedbox/inspect",			farmer.InspectSeedBox)
	server.Get("/seedbox/:seedbox/backup/list",		farmer.SeedBoxBackupList)
	server.Get("/seedbox/:seedbox/domain/list",		farmer.ListDomain)

	server.Post("/seedbox/create",					farmer.CreateSeedBox)
	server.Post("/seedbox/deploy",					farmer.DeployOnSeedBox)
	server.Post("/seedbox/backup/create",			farmer.BackUpSeedBoxVolumes)
	server.Post("/seedbox/domain/add",				farmer.AddDomain)

	server.Delete("/seedbox/delete",				farmer.DeleteSeedBox)
	server.Delete("/seedbox/backup/delete/:tag",	farmer.RestoreSeedBoxVolumes)
	server.Delete("/seedbox/domain/delete",			farmer.DeleteDomain)

	server.RunOnAddr(":"+farmer.port)
}
