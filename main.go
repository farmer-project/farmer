package main

import (
	"os"

	"github.com/farmer-project/farmer/api"
)

func main() {
	api := &api.FarmerApi{
		port: os.Getenv("LISTEN"),
	}

	api.start()
}
