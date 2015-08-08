package main

import (
	"fmt"
	"os"

	"github.com/farmer-project/farmer/api"
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/hub"
)

func services() {
	fmt.Print("Setting up database server...")
	db.SetupServer()
	fmt.Println("Database server is up.")

	fmt.Print("Setting up station server...")
	hub.SetupServer()
	fmt.Println("Station server is up.")

	// FIXME: Sometimes!!! in installation part db container connection failed til 1 min!!??? :O
	db.Sync()
}

func main() {
	services()

	Api := &api.Api{
		Port: os.Getenv("LISTEN"),
	}

	Api.Listen()
}
