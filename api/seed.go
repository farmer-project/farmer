package api

import (
	"net/http"

	"fmt"
	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/brain"
	"github.com/farmer-project/farmer/station"
	"github.com/go-martini/martini"
)

// POST
func (f *FarmerApi) createSeed(res http.ResponseWriter, req request.CreateSeedRequest) string {
	hub := &station.Hub{}
	connectedHub, err := hub.CreateConnection()

	if err == nil {
		go brain.Create(req, connectedHub)
		return connectedHub.Queue.Name
	}

	return err.Error()
}

// POST
func (f *FarmerApi) deployOnSeed(res http.ResponseWriter, req request.DeploySeedRequest) string {
	hub := &station.Hub{}
	connectedHub, err := hub.CreateConnection()
	fmt.Println("here in deploy")
	if err == nil {
		brain.Deploy(req, connectedHub)
		return connectedHub.Queue.Name
	}
	fmt.Println(err.Error())
	return err.Error()
}

// DELETE
func (f *FarmerApi) deleteSeed(params martini.Params) string {
	return "Hi"
}

// POST
func (f *FarmerApi) runCommandOnSeed(params martini.Params) string {
	return "Hi"
}

// GET
func (f *FarmerApi) listSeed() string {
	return "Hi"
}

// GET
func (f *FarmerApi) inspectSeed(params martini.Params) string {
	return params["seedbox"]
}
