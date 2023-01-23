package v1

import (
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"gitlab.com/patrick.erber/kdd/internal/models"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
	"gitlab.com/patrick.erber/kdd/internal/services"
)

type API struct {
	ds *persistence.DataStore
	ka *services.KubeAPIAdapter
}

func NewAPI(ds *persistence.DataStore, ka *services.KubeAPIAdapter) *API {
	return &API{
		ds: ds,
		ka: ka,
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

func (a *API) GetNamespace(c *gin.Context) {
	name := c.Param("name")
	if name == "" {
		a.Response(c, http.StatusBadRequest, BAD_REQUEST, nil)
		return
	}

	namespace, err := a.ds.GetNamespace(name)
	if err != nil && err.Error() == fmt.Sprintf("namespace %s could not be found", name) {
		a.Response(c, http.StatusNotFound, NOT_FOUND, "namespace %s could not be found")
		return
	} else if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, "an internal server error occurred")
		return
	}

	workloadsCollection, err := a.ds.GetWorkloadsByNamespace(name)
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, "an internal server error occurred")
		return
	}

	eventsCollection, err := a.ka.GetEventsForNamespace(name)
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, "an internal server error occurred")
		return
	}

	// sorting workload result
	workloadResult := workloadsCollection.ToList()
	workloads := make([]models.Workload, len(workloadResult))
	for i := 0; i < len(workloadResult); i++ {
		workloads[i] = workloadResult[i].(models.Workload)
	}

	sort.Sort(models.ByWorkloadName(workloads))

	// casting event list
	eventResult := eventsCollection.ToList()
	events := make([]models.Event, len(eventResult))
	for i := 0; i < len(eventResult); i++ {
		events[i] = eventResult[i].(models.Event)
	}

	a.Response(c, http.StatusOK, SUCCESS, struct {
		Namespace models.Namespace  `json:"namespace"`
		Workloads []models.Workload `json:"workloads"`
		Events    []models.Event    `json:"events"`
	}{
		Namespace: *namespace,
		Workloads: workloads,
		Events:    events,
	})
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

func (a *API) GetDeployments(c *gin.Context) {
	f := make(map[string]string)
	f["workload_type"] = models.WORKLOAD_TYPE_DEPLOYMENT

	if c.Query("namespace") != "" {
		f["namespace"] = c.Query("namespace")
	}

	if c.Query("name") != "" {
		f["name"] = c.Query("name")
	}

	collection, err := a.ds.GetWorkloadsBy(f)
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

func (a *API) GetDeployment(c *gin.Context) {
	f := make(map[string]string)
	f["workload_type"] = models.WORKLOAD_TYPE_DEPLOYMENT

	if c.Param("namespace") != "" {
		f["namespace"] = c.Param("namespace")
	} else {
		a.Response(c, http.StatusBadRequest, BAD_REQUEST, nil)
		return
	}

	if c.Param("name") != "" {
		f["workload_name"] = c.Param("name")
	} else {
		a.Response(c, http.StatusBadRequest, BAD_REQUEST, nil)
		return
	}

	workload, err := a.ds.GetWorkloadBy(f)
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, nil)
		return
	}

	podsCollection, err := a.ds.GetPodsForWorkload(workload)
	if err != nil {
		a.Response(c, http.StatusInternalServerError, ERROR, nil)
		return
	}

	// sorting result
	result := podsCollection.ToList()
	pods := make([]models.Workload, len(result))
	for i := 0; i < len(result); i++ {
		pods[i] = result[i].(models.Workload)
	}

	sort.Sort(models.ByWorkloadName(pods))

	rate := time.Minute * 5
	if c.Query("rate") != "" {
		rate, err = time.ParseDuration(c.Query("rate"))
		if err != nil {
			zap.L().Error("Could not parse value for rate", zap.String("query_rate", c.Query("rate")))
			a.Response(c, http.StatusBadRequest, BAD_REQUEST, nil)
		}
	}

	a.Response(c, http.StatusOK, SUCCESS, struct {
		Workload models.Workload             `json:"workload"`
		Pods     []models.Workload           `json:"pods"`
		Metrics  []models.PodContainerMetric `json:"metrics"`
	}{
		Workload: workload,
		Pods:     pods,
		Metrics:  a.getPodMetrics(c.Param("namespace"), pods, rate),
	})
}

func (a *API) getPodMetrics(namespace string, pods []models.Workload, rate time.Duration) []models.PodContainerMetric {
	result, err := a.ds.GetMetricsForPodsInNamespace(namespace, pods)
	if err != nil {
		zap.L().Error("could not load metrics for pods")
		return make([]models.PodContainerMetric, 0)
	}

	list := result.ToList()
	metrics := make([]models.PodContainerMetric, len(list))
	for i := 0; i < len(list); i++ {
		metrics[i] = list[i].(models.PodContainerMetric)
	}

	sort.Sort(models.ByContainerMetricsTimestamp(metrics))

	return models.ReduceMetrics(metrics, rate)
}

func (a *API) GetStatefulSets(c *gin.Context) {
	collection, err := a.ds.GetAllByWorkloadType(models.WORKLOAD_TYPE_STATEFULSET)
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

func (a *API) GetDaemonSet(c *gin.Context) {
	collection, err := a.ds.GetAllByWorkloadType(models.WORKLOAD_TYPE_DEAMONSET)
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

	// sorting result
	result := collection.ToList()
	metrics := make([]models.PodContainerMetric, len(result))
	for i := 0; i < len(result); i++ {
		metrics[i] = result[i].(models.PodContainerMetric)
	}

	sort.Sort(models.ByContainerMetricsTimestamp(metrics))

	rate := time.Minute * 5
	if c.Query("rate") != "" {
		rate, err = time.ParseDuration(c.Query("rate"))
		if err != nil {
			zap.L().Error("Could not parse value for rate", zap.String("query_rate", c.Query("rate")))
			a.Response(c, http.StatusBadRequest, BAD_REQUEST, nil)
		}
	}

	a.Response(c, http.StatusOK, SUCCESS, models.ReduceMetrics(metrics, rate))
}
