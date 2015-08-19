package api

import (
	"encoding/json"

	"github.com/farmer-project/farmer/api/request"
	"github.com/farmer-project/farmer/api/response"
	"github.com/farmer-project/farmer/controller"
	"github.com/farmer-project/farmer/farmer"
	"github.com/farmer-project/farmer/hub"
	"github.com/go-martini/martini"
)

// POST
func boxCreate(req request.CreateRequest) (int, string) {
	stream, err := hub.CreateStream()

	if err != nil {
		return 500, err.Error()
	}

	go controller.BoxCreate(req.Name, req.RepoUrl, req.Pathspec, stream)

	json, _ := json.Marshal(&response.StreamResponse{
		AmqpURI:   stream.AmqpURI(),
		QueueName: stream.Queue.Name,
	})

	return 201, string(json)
}

// PUT
func boxDeploy(req request.DeployRequest, params martini.Params) (int, string) {
	stream, err := hub.CreateStream()

	if err != nil {
		return 500, string(err.Error())
	}

	go controller.BoxDeploy(params["name"], req.Pathspec, stream)

	json, _ := json.Marshal(&response.StreamResponse{
		AmqpURI:   stream.AmqpURI(),
		QueueName: stream.Queue.Name,
	})

	return 200, string(json)
}

// GET
func boxInspect(params martini.Params) (int, string) {
	box, err := farmer.FindBoxByName(params["name"])

	if err != nil {
		return 500, err.Error()
	}

	json, _ := json.Marshal(box)

	return 200, string(json)
}

// GET
func boxList(params martini.Params) (int, string) {
	boxes, err := controller.BoxList()

	if err != nil {
		return 500, err.Error()
	}

	json, _ := json.Marshal(boxes)

	return 200, string(json)
}

// DELETE
func boxDestroy(params martini.Params) (int, string) {
	if err := controller.BoxDestroy(params["name"]); err != nil {
		return 500, err.Error()
	}

	return 204, ""
}
