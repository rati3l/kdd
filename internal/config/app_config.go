package config

import "github.com/spf13/viper"

type AppConfig struct {
	Namespaces []string
	Workloads  []string
}

func GetConfig(configPath string, configName string) *AppConfig {
	cfg := AppConfig{}
	viper.SetConfigType("yaml")
	viper.AddConfigPath(configPath)
	viper.SetConfigName(configName)
	err := viper.Unmarshal(&cfg)

	if err != nil {
		return nil
	}

	return &cfg
}
