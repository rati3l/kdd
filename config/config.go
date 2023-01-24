package main

import (
	"flag"

	"go.uber.org/zap"
)

type Configuration struct {
	local    bool
	yamlPath string
	http     struct {
		port int
	}
}

func GetConfig() (Configuration, error) {

	Config := new(Configuration)
	flag.BoolVar(&Config.local, "local", false, "whenever to use local auth (kubeconfig) or in-cluster authentication")
	flag.StringVar(&Config.yamlPath, "local", "./config", "location of the config yaml file")

	flag.Parse()

	validateYaml(Config.yamlPath)

	return *Config, nil
}

func validateYaml(path string) {
	// TODO
	zap.L().Debug(path)
}

func unmarshallYaml(path string) {
	// TODO
}
