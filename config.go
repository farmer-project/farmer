package main

import (
	"fmt"

	"github.com/spf13/viper"
)

const CONFIG_FOLDER = "/etc/farmer"

type Config struct {
	Port			int
	Docker_Api, Greenhouse_Vol, Farmland_Vol string
}

func (c *Config) init() {
	viper.SetConfigName("farmer")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(CONFIG_FOLDER)
	err := viper.ReadInConfig()

	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}

	fmt.Println("samavar1")

	c.Port = viper.GetInt("port")
	c.Docker_Api = viper.GetString("docker_api")
	c.Greenhouse_Vol = viper.GetString("greenhouse_vol")
	c.Farmland_Vol = viper.GetString("farmland_vol")
}