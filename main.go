package main

import (
	"os"

	"github.com/farmer-project/farmer/api"
)

func main() {
	Api := &api.FarmerApi{
		Port: os.Getenv("LISTEN"),
	}

	Api.Listen()
}
