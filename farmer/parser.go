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
	Scripts map[string]string `sql:"-" json:"-"`
}

func (b *Box) parseFarmerfile() error {
	filename, _ := filepath.Abs(b.CodeDirectory + "/.farmer.yml")
	yamlFile, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	if err := yaml.Unmarshal(yamlFile, &b.FarmerConfig); err != nil {
		return err
	}

	return setDefaultConfig(&b.FarmerConfig)
}

func setDefaultConfig(config *FarmerConfig) error {
	if config.Home == "" {
		config.Home = "/app"
	}

	return nil
}