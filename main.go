package main

import (
	"fmt"
	"os"

	"github.com/farmer-project/farmer/api"
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/station"
)

func services() {
	fmt.Print("Database server....")
	db.UpServer()
	fmt.Println("up")

	fmt.Print("Station server....")
	station.UpServer()
	fmt.Println("up")

	// FIXME: Sometimes!!! in installation part db container connection failed til 1 min!!!!!!??? :O
	db.Connect()
	db.Sync()
	fmt.Println("Main init done")
}

func main() {
	services()

	Api := &api.FarmerApi{
		Port: os.Getenv("LISTEN"),
	}

	Api.Listen()
}
