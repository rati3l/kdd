package config

import (
	"flag"
	"sync"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type Config struct {
	Local          bool   `yaml:"local"`
	HttpPort       int    `yaml:"http_port"`
	StaticFiles    string `yaml:"static_files"`
	KubeConfigPath string `yaml:"kube_config_path"`
}

var configInstance *Config
var lock = &sync.Mutex{}

func init() {
	pflag.String("config", ".", "location of the config yaml file")
	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
}

func GetConfig() (*Config, error) {
	if configInstance == nil {
		lock.Lock()
		defer lock.Unlock()
		if configInstance == nil {
			configInstance, _ = LoadConfig()
		}
	}

	return configInstance, nil
}

func LoadConfig() (config *Config, err error) {

	viper.BindPFlags(pflag.CommandLine)
	configPath := viper.GetString("config")
	zap.L().Error(configPath)

	viper.AddConfigPath(configPath)
	viper.SetConfigName("kdd")
	viper.SetConfigType("yaml")

	viper.SetDefault("Local", false)
	viper.SetDefault("HttpPort", 3333)
	viper.SetDefault("StaticFiles", "/app/_ui/build/")

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
