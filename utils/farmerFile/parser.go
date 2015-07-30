package farmerFile

import (
	"path/filepath"
	"io/ioutil"
	"gopkg.in/yaml.v2"
)

type ConfigFile struct {
	Image string
	Ports []string
	Env   []string
}


func Parse(address string) (ConfigFile, error) {
	filename, _ := filepath.Abs(address + "/.farmer.yml")
	yamlFile, err := ioutil.ReadFile(filename)

	if err != nil {
		return ConfigFile{}, err
	}

	var farmerFile ConfigFile
	err = yaml.Unmarshal(yamlFile, &farmerFile)

	if err != nil {
		return ConfigFile{}, err
	}

	return farmerFile, nil
}
