package main

import (
	"fmt"
	"os"

	"code.google.com/p/goconf"
)

type config struct {
	Port			uint16
	Greenhouse_Vol	string
	Farmland_Vol	string
	Docker_Api		string
}

func main() {
	fmt.Println(os.Getenv("farmer_port"));
	c, err = goconf.ReadConfigFile("farmer.conf")
	fmt.Println(c.GetInt("port"));

}