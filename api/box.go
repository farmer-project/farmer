package api

import (
	"encoding/json"
	"net/http"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/api/response"
	"github.com/farmer-project/farmer/brain"
	"github.com/farmer-project/farmer/hub"
	"github.com/go-martini/martini"
)

// POST
func (f *Api) boxCreate(res http.ResponseWriter, req request.CreateRequest) (int, string) {
	stream, err := hub.CreateStream()

	if err != nil {
		return 500, err.Error()
	}

	go brain.Create(req.Hostname, req.RepoUrl, req.PathSpec, stream)

	json, _ := json.Marshal(&response.StreamResponse{
		AmqpURI:   stream.AmpqURI(),
		QueueName: stream.Queue.Name,
	})

	return 201, string(json)
}

// PUT
func (f *Api) boxDeploy(res http.ResponseWriter, req request.DeployRequest, params martini.Params) (int, string) {
	stream, err := hub.CreateStream()

	if err != nil {
		return 500, string(err.Error())
	}

	go brain.Deploy(params["hostname"], req.PathSpec, stream)

	json, _ := json.Marshal(&response.StreamResponse{
		AmqpURI:   stream.AmpqURI(),
		QueueName: stream.Queue.Name,
	})

	return 200, string(json)
}

// GET
func (f *Api) boxInspect(params martini.Params) string {
	return "Hi"
}

// GET
func (f *Api) boxList(params martini.Params) (int, string) {
	return "Hi"
}

// DELETE
func (f *Api) boxDelete(params martini.Params) string {
	return "Hi"
}
