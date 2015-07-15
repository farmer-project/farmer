package api

import (
	"github.com/go-martini/martini"
)

type FarmerApi struct {
	Port string
}

func (farmer *FarmerApi) Listen() {
	server := martini.Classic()
	server.Get("/seedbox/list",						farmer.listSeedBox)
	server.Get("/seedbox/:seedbox/inspect",			farmer.inspectSeedBox)
	server.Get("/seedbox/:seedbox/backup/list",		farmer.seedBoxBackupList)
	server.Get("/seedbox/:seedbox/domain/list",		farmer.listDomain)

	server.Post("/seedbox/create",					farmer.createSeedBox)
	server.Post("/seedbox/deploy",					farmer.deployOnSeedBox)
	server.Post("/seedbox/backup/create",			farmer.backUpSeedBoxVolumes)
	server.Post("/seedbox/domain/add",				farmer.addDomain)

	server.Delete("/seedbox/delete",				farmer.deleteSeedBox)
	server.Delete("/seedbox/backup/delete/:tag",	farmer.restoreSeedBoxVolumes)
	server.Delete("/seedbox/domain/delete",			farmer.deleteDomain)

	server.RunOnAddr(":"+farmer.Port)
}
