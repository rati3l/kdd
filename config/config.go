package config

import (
	"flag"
	"sync"

	"go.uber.org/zap"
)

type Configuration struct {
	Local    bool
	YamlPath string
	http     struct {
		port int
	}
}

var configInstance *Configuration
var lock = &sync.Mutex{}

func GetConfig() (*Configuration, error) {
	if configInstance == nil {
		lock.Lock()
		defer lock.Unlock()
		if configInstance == nil {
			configInstance, _ = PrepareConfig()
		}
	}

	return configInstance, nil
}

func PrepareConfig() (*Configuration, error) {

	Config := new(Configuration)
	flag.BoolVar(&Config.Local, "local", false, "whenever to use local auth (kubeconfig) or in-cluster authentication")
	flag.StringVar(&Config.YamlPath, "yaml", "./config", "location of the config yaml file")

	flag.Parse()

	validateYaml(Config.YamlPath)

	return Config, nil
}

func validateYaml(path string) {
	// TODO
	zap.L().Debug(path)
}

func unmarshallYaml(path string) {
	// TODO
}
