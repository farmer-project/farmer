package farmer

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path/filepath"
)

type FarmerConfig struct {
	Image   string            `json:"image"`
	Home    string            `json:"home" sql:"default:'/app'"`
	Ports   []string          `sql:"-" json:"ports"`
	Env     []string          `sql:"-" json:"-"`
	Shared  []string          `sql:"-" json:"-"`
	Scripts map[string]string `sql:"-" json:"-"`
}

func (r *Release) parseFarmerfile() error {
	filename, _ := filepath.Abs(r.CodeDirectory + "/.farmer.yml")
	yamlFile, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	if err := yaml.Unmarshal(yamlFile, &r.FarmerConfig); err != nil {
		return err
	}

	return setDefaultConfig(&r.FarmerConfig)
}

func setDefaultConfig(config *FarmerConfig) error {
	if config.Home == "" {
		config.Home = "/app"
	}

	return nil
}
