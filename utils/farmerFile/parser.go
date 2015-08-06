package farmerFile

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path/filepath"
)

const (
	SCRIPT_CREATE = "create"
	SCRIPT_DEPLOY = "deploy"
)

type FarmerConfig struct {
	Image   string
	Ports   []string
	Env     []string
	Scripts map[string]string
}

func Parse(address string) (FarmerConfig, error) {
	filename, _ := filepath.Abs(address + "/.farmer.yml")
	yamlFile, err := ioutil.ReadFile(filename)

	if err != nil {
		return FarmerConfig{}, err
	}

	var farmerConfig FarmerConfig
	err = yaml.Unmarshal(yamlFile, &farmerConfig)

	if err != nil {
		return FarmerConfig{}, err
	}

	return farmerConfig, nil
}
