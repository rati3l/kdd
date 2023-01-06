package router

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
	v1 "gitlab.com/patrick.erber/kdd/internal/router/api/v1"
)

func InitRouter(ds *persistence.DataStore) *gin.Engine {
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
		api := v1.NewAPI(ds)
		apiv1.GET("/namespaces", api.GetNamespaces)
		apiv1.GET("/workloads", api.GetWorkloads)
		apiv1.GET("/container-metrics", api.GetContainerMetrics)
	}

	return r
}
