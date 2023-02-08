package config

import (
	"flag"
	"fmt"
	"path/filepath"
	"strings"
	"sync"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"k8s.io/client-go/util/homedir"
)

type Config struct {
	Local          bool   `mapstructure:"local"`
	HttpPort       int    `mapstructure:"http_port"`
	StaticFiles    string `mapstructure:"static_files"`
	KubeConfigPath string `mapstructure:"kube_config_path"`
}

var configInstance *Config
var lock = &sync.Mutex{}

func init() {
	pflag.String("config", "../", "location of the config yaml file")
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

	viper.AddConfigPath(configPath)
	viper.SetConfigName("kdd")
	viper.SetConfigType("yaml")

	// viper.SetDefault does not currently work with viper.Unmarshall https://github.com/spf13/viper/issues/1284
	// so we're creating a config struct pre-populated with defaults

	// viper.SetDefault("Local", false)
	// viper.SetDefault("HttpPort", 3333)
	// viper.SetDefault("StaticFiles", "/_ui/build/")
	// viper.SetDefault("KubeConfigPath", filepath.Join(homedir.HomeDir(), ".kube", "config"))

	config = &Config{
		Local:          false,
		HttpPort:       3333,
		StaticFiles:    "../_ui/build/",
		KubeConfigPath: filepath.Join(homedir.HomeDir(), ".kube", "config"),
	}

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	// from https://github.com/spf13/viper/issues/188
	// viper.Unmarshal does not yet handle env var substitution

	env_prefix := "KDD_"
	for _, key := range viper.AllKeys() {
		fmt.Println(key)
		envKey := strings.ToUpper(env_prefix + key)
		err := viper.BindEnv(key, envKey)
		if err != nil {
			zap.L().Fatal("config: unable to bind env: ", zap.Error(err))

		}
	}

	err = viper.Unmarshal(&config)
	fmt.Println(config)
	return
}
