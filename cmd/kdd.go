package main

import (
	"errors"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"gitlab.com/patrick.erber/kdd/config"
	"gitlab.com/patrick.erber/kdd/internal/adapters"
	"gitlab.com/patrick.erber/kdd/internal/collector"
	"gitlab.com/patrick.erber/kdd/internal/controller"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
	"gitlab.com/patrick.erber/kdd/internal/router"
	"go.uber.org/zap"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	metrics "k8s.io/metrics/pkg/client/clientset/versioned"
)

func sigHandler() <-chan struct{} {
	stop := make(chan struct{})

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c,
			syscall.SIGINT,  // Ctrl+C
			syscall.SIGTERM, // Termination Request
			syscall.SIGSEGV, // FullDerp
			syscall.SIGABRT, // Abnormal termination
			syscall.SIGILL,  // illegal instruction
			syscall.SIGFPE,  // floating point
		)
		sig := <-c
		zap.L().Info("termination signal detected, shutting down", zap.String("signal", sig.String()))
		close(stop)
	}()

	return stop
}

func getClientConfig() (*rest.Config, string) {
	// TODO viper
	kddConfig, err := config.GetConfig()
	if err != nil {
		zap.L().Error("Failed to get the configuration", zap.Error(err))
	}

	zap.L().Sugar().Errorf("%v", kddConfig.Local)
	var cfg *rest.Config
	var kubeconfig string

	if kddConfig.Local {
		kubeconfig = filepath.Join(homedir.HomeDir(), ".kube", "config")
		cfg, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			zap.L().Fatal("build kubernetes flag", zap.String("kubeconfig", kubeconfig))
		}
	} else {
		kubeconfig = "in cluster configuration"
		cfg, err = rest.InClusterConfig()
		if err != nil {
			zap.L().Fatal("could not create config", zap.String("kubeconfig", kubeconfig))
		}
	}

	return cfg, kubeconfig
}

func buildClientSet() *kubernetes.Clientset {
	config, kubeconfig := getClientConfig()
	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		zap.L().Fatal("could not create kubernetes client set", zap.String("kubeconfig", kubeconfig))
	}

	return clientSet
}

func buildMetricsClientSet() *metrics.Clientset {
	config, kubeconfig := getClientConfig()
	clientSet, err := metrics.NewForConfig(config)
	if err != nil {
		zap.L().Fatal("could not create kubernetes metrics client set", zap.String("kubeconfig", kubeconfig))
	}

	return clientSet
}

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	undo := zap.ReplaceGlobals(logger)
	defer undo()

	// TODO handle config here
	// get config
	// kddConfig, err := config.GetConfig()
	// if err != nil {
	// 	zap.L().Error("Failed to get the configuration", zap.Error(err))
	// }
	// zap.L().Error(kddConfig.YamlPath)

	// Initialize Database
	ds, err := persistence.NewSQLiteDataStore("data.sqlite")
	if err != nil {
		zap.L().Error("failed to initialize data store", zap.Error(err))
	}
	defer ds.CloseConnections()

	// Configure Collector & pass it to controller for handling the updates
	cfg := collector.WorkloadCollectorConfig{
		ClientSet:         buildClientSet(),
		MertricsClientSet: buildMetricsClientSet(),
	}
	collector := collector.NewWorkloadCollector(&cfg)
	ctrl := controller.NewController(collector, ds, time.Second*10)

	sigReceiver := sigHandler()
	go ctrl.Run(sigReceiver)

	// Configure HTTP Server
	gin.SetMode(gin.DebugMode)
	server := http.Server{
		Addr:           ":3333",
		ReadTimeout:    30 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
		Handler:        router.InitRouter(ds, adapters.NewKubeAPIAdapter(&adapters.KubeAPIAdapterConfig{ClientSet: buildClientSet()})),
	}

	go func() {
		err = server.ListenAndServe()
		if errors.Is(err, http.ErrServerClosed) {
			zap.L().Info("server closed")
		} else if err != nil {
			zap.L().Fatal("error starting server", zap.Error(err))
		}
	}()

	<-sigReceiver // wait for the termination signal

}
