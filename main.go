package main

import (
	"os"

	"github.com/farmer-project/farmer/api"
	"github.com/farmer-project/farmer/station"
	"fmt"
)

func init() {
	fmt.Print("station server")
	station.UpServer()
	fmt.Print("....up")
	fmt.Println("")

}

func main() {
	Api := &api.FarmerApi{
		Port: os.Getenv("LISTEN"),
	}

	Api.Listen()
}
