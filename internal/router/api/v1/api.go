package v1

import (
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
	"gitlab.com/patrick.erber/kdd/internal/models"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
)

type API struct {
	ds *persistence.DataStore
}

func NewAPI(ds *persistence.DataStore) *API {
	return &API{
		ds: ds,
	}
}

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func (a *API) Response(c *gin.Context, httpCode, errCode int, data interface{}) {
	c.JSON(httpCode, Response{
		Code: errCode,
		Msg:  GetErrorMsg(errCode),
		Data: data,
	})
}

func (a *API) GetNamespaces(c *gin.Context) {
	collection, err := a.ds.GetAllNamespaces()
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, nil)
		return
	}

	// sorting result
	result := collection.ToList()
	namespaces := make([]models.Namespace, len(result))
	for i := 0; i < len(result); i++ {
		namespaces[i] = result[i].(models.Namespace)
	}
	sort.Sort(models.ByNamespaceName(namespaces))

	a.Response(c, http.StatusOK, SUCCESS, namespaces)
}

func (a *API) GetWorkloads(c *gin.Context) {
	collection, err := a.ds.GetAllWorkloads()
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, nil)
		return
	}

	// sorting result
	result := collection.ToList()
	workloads := make([]models.Workload, len(result))
	for i := 0; i < len(result); i++ {
		workloads[i] = result[i].(models.Workload)
	}

	sort.Sort(models.ByWorkloadName(workloads))

	a.Response(c, http.StatusOK, SUCCESS, workloads)
}

func (a *API) GetContainerMetrics(c *gin.Context) {
	collection, err := a.ds.GetAllMetrics()
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, nil)
		return
	}
	a.Response(c, http.StatusOK, SUCCESS, collection.ToList())
}
