package api

import (
	"encoding/json"
	"net/http"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/api/response"
	"github.com/farmer-project/farmer/controller"
	"github.com/farmer-project/farmer/hub"
	"github.com/go-martini/martini"
)

// POST
func (f *Api) boxCreate(res http.ResponseWriter, req request.CreateRequest) string {
	stream, err := hub.CreateStream()

	if err == nil {
		go controller.Create(req.Hostname, req.RepoUrl, req.PathSpec, stream)

		json, _ := json.Marshal(&response.StreamResponse{
			AmqpURI:   stream.AmpqURI(),
			QueueName: stream.Queue.Name,
		})

		return string(json)
	}

	return err.Error()
}

// PUT
func (f *Api) boxDeploy(res http.ResponseWriter, req request.DeployRequest, params martini.Params) string {
	stream, err := hub.CreateStream()

	if err != nil {
		return string(err.Error())
	}

	go controller.Deploy(params["hostname"], req.PathSpec, stream)

	json, _ := json.Marshal(&response.StreamResponse{
		AmqpURI:   stream.AmpqURI(),
		QueueName: stream.Queue.Name,
	})

	return string(json)
}

// GET
func (f *Api) boxInspect(params martini.Params) string {
	return "Hi"
}

// GET
func (f *Api) boxList(params martini.Params) string {
	return "Hi"
}

// DELETE
func (f *Api) boxDelete(params martini.Params) string {
	return "Hi"
}
