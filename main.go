package main

import (
	"github.com/farmer-project/farmer/api"
	"github.com/farmer-project/farmer/db"
	"github.com/farmer-project/farmer/farmer"
)

func main() {
	// Database
	db.Connect()
	defer db.Close()

	db.DB.AutoMigrate(
		&farmer.Box{},
	)

	// API Server
	api.Listen()
}
