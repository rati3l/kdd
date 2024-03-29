package router

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gitlab.com/patrick.erber/kdd/internal/adapters"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
	v1 "gitlab.com/patrick.erber/kdd/internal/router/api/v1"
)

func InitRouter(ds *persistence.DataStore, ka *adapters.KubeAPIAdapter) *gin.Engine {
	r := gin.New()

	r.StaticFS("/static", http.Dir("../_ui/build/static"))
	r.LoadHTMLFiles("../_ui/build/index.html")
	for _, page := range []string{"favicon.ico", "manifest.json", "robots.txt"} {
		r.StaticFile(fmt.Sprintf("/%s", page), fmt.Sprintf("../_ui/build/%s", page))
	}

	r.GET("/ui/*page", func(c *gin.Context) {
		// render html file with subpaths
		c.HTML(200, "index.html", gin.H{})
	})

	apiv1 := r.Group("/api/v1")
	{
		api := v1.NewAPI(ds, ka)
		apiv1.GET("/nodes", api.GetNodes)
		apiv1.GET("/namespaces", api.GetNamespaces)
		apiv1.GET("/namespaces/:name", api.GetNamespace)
		apiv1.GET("/workloads", api.GetWorkloads)
		apiv1.GET("/workloads/deployments", api.GetDeployments)
		apiv1.GET("/workloads/pods/:namespace/:name", api.GetPod)
		apiv1.GET("/workloads/:workloadType/:namespace/:name", api.GetWorkload)
		apiv1.GET("/workloads/statefulsets", api.GetStatefulSets)
		apiv1.GET("/workloads/jobs", api.GetJobs)
		apiv1.GET("/workloads/cronjobs", api.GetCronjobs)
		apiv1.GET("/workloads/pods", api.GetPods)
		apiv1.GET("/workloads/daemonsets", api.GetDaemonSet)
		apiv1.GET("/container-metrics", api.GetContainerMetrics)
	}

	return r
}
