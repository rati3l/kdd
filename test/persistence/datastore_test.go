package persistence_test

import (
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gitlab.com/patrick.erber/kdd/internal/models"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
)

func CompareStringMap(a, b map[string]string) bool {
	if len(a) != len(b) {
		return false
	}

	for k, v := range a {
		if w, ok := b[k]; !ok || v != w {
			return false
		}
	}

	return true
}

func CompareNamespaces(a, b interface{}) bool {
	aNS := a.(models.Namespace)
	bNS := b.(models.Namespace)
	if aNS.Name != bNS.Name {
		return false
	}
	if aNS.CreationTimestamp.Unix() != bNS.CreationTimestamp.Unix() {
		return false
	}
	if !CompareStringMap(aNS.Annotations, bNS.Annotations) || !CompareStringMap(aNS.Labels, bNS.Labels) {
		return false
	}

	return true
}

func CompareWorkloads(a, b interface{}) bool {
	aWl := a.(models.Workload)
	bWl := b.(models.Workload)

	if aWl.GetWorkloadName() != bWl.GetWorkloadName() || aWl.GetNamespace() != bWl.GetNamespace() {
		return false
	}
	if aWl.GetCreationTimestamp().Unix() != bWl.GetCreationTimestamp().Unix() {
		return false
	}
	if !CompareStringMap(aWl.GetAnnotations(), bWl.GetAnnotations()) || !CompareStringMap(aWl.GetLabels(), bWl.GetLabels()) || !CompareStringMap(aWl.GetSelector(), bWl.GetSelector()) {
		return false
	}
	if !CompareContainers(aWl.GetContainers(), bWl.GetContainers()) {
		return false
	}

	switch aWl.GetType() {
	case models.WORKLOAD_TYPE_DEPLOYMENT:
		aStatus := aWl.GetWorkloadStatus().(models.DeploymentStatus)
		bStatus := bWl.GetWorkloadStatus().(models.DeploymentStatus)

		if aStatus.Available != bStatus.Available || aStatus.Desired != bStatus.Desired || aStatus.Ready != bStatus.Ready || aStatus.Up2date != bStatus.Up2date {
			return false
		}

	case models.WORKLOAD_TYPE_DEAMONSET:
		aStatus := aWl.GetWorkloadStatus().(models.DaemonSetStatus)
		bStatus := bWl.GetWorkloadStatus().(models.DaemonSetStatus)

		if aStatus.Available != bStatus.Available || aStatus.Desired != bStatus.Desired || aStatus.Ready != bStatus.Ready || aStatus.Up2date != bStatus.Up2date {
			return false
		}

	case models.WORKLOAD_TYPE_STATEFULSET:
		aStatus := aWl.GetWorkloadStatus().(models.StatefulSetStatus)
		bStatus := bWl.GetWorkloadStatus().(models.StatefulSetStatus)

		if aStatus.Available != bStatus.Available || aStatus.Replicas != bStatus.Replicas || aStatus.Ready != bStatus.Ready || aStatus.Up2date != bStatus.Up2date {
			return false
		}

	case models.WORKLOAD_TYPE_POD:
		aStatus := aWl.GetWorkloadStatus().(string)
		bStatus := bWl.GetWorkloadStatus().(string)

		if aStatus != bStatus {
			return false
		}

	}

	return true
}

func CompareContainerMetrics(a interface{}, b interface{}) bool {
	aContainerMetric := a.(models.PodContainerMetric)
	bContainerMetric := b.(models.PodContainerMetric)

	if aContainerMetric.ContainerName != bContainerMetric.ContainerName ||
		aContainerMetric.Namespace != bContainerMetric.Namespace ||
		aContainerMetric.CPUUsage != bContainerMetric.CPUUsage ||
		aContainerMetric.CreationTimestamp.Unix() != bContainerMetric.CreationTimestamp.Unix() ||
		aContainerMetric.MemoryUsage != bContainerMetric.MemoryUsage ||
		aContainerMetric.PodName != bContainerMetric.PodName {
		return false
	}

	return true
}

func CompareContainers(a []models.Container, b []models.Container) bool {
	if len(a) != len(b) {
		return false
	}

	for _, aContainer := range a {
		found := false
		for _, bContainer := range b {
			if aContainer.ContainerName == bContainer.ContainerName &&
				aContainer.Image == bContainer.Image &&
				aContainer.ImageVersion == bContainer.ImageVersion &&
				aContainer.InitContainer == bContainer.InitContainer &&
				aContainer.LimitCPU == bContainer.LimitCPU &&
				aContainer.LimitMemory == bContainer.LimitMemory &&
				aContainer.RequestCPU == bContainer.RequestCPU &&
				aContainer.RequestMemory == bContainer.RequestMemory {
				found = true
			}
		}

		if !found {
			return false
		}
	}

	return true
}

func setupPersistenceTestSuite(t *testing.T) (*persistence.DataStore, func(t *testing.T)) {
	log.Println("setup persistence test suite")
	filename := "../data/test_data.sqlite"
	ds, err := persistence.NewSQLiteDataStore(filename)
	if err != nil {
		assert.FailNow(t, fmt.Sprintf("error occurred during initalization of the sqlite database %v", err))
	}

	return ds, func(t *testing.T) {
		log.Println("teardown persistence test suite")
		if _, err := os.Stat(filename); !os.IsNotExist(err) {
			err := os.Remove(filename)
			if err != nil {
				assert.FailNow(t, fmt.Sprintf("failed to cleanup database file %v", err))
			}
		}
	}
}

func TestReplaceNamespaces(t *testing.T) {

	ds, teardownFunc := setupPersistenceTestSuite(t)
	defer teardownFunc(t)

	labels := make(map[string]string)
	labels["managed_by"] = "kdd"
	labels["app"] = "kdd"

	annotations := make(map[string]string)
	annotations["log_format"] = "json"
	annotations["splunk.com/exclude"] = "true"

	defaultNS := models.Namespace{
		Name:              "default",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	kubeSystemNS := models.Namespace{
		Name:              "kube-system",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	monitoringNS := models.Namespace{
		Name:              "monitoring",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	collection1 := models.NewCollection()
	collection1.Set("default", defaultNS, true)
	collection1.Set("kube-system", kubeSystemNS, true)

	assert.NoError(t, ds.ReplaceNamespaces(collection1))
	resultCollection, err := ds.GetAllNamespaces()
	assert.NoError(t, err)
	assert.Equal(t, collection1.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection1, resultCollection, CompareNamespaces), "The collections need to be equal")

	collection2 := models.NewCollection()
	collection2.Set("default", defaultNS, true)
	collection2.Set("monitoring", monitoringNS, true)

	assert.NoError(t, ds.ReplaceNamespaces(collection2))
	resultCollection, err = ds.GetAllNamespaces()
	assert.NoError(t, err)
	assert.Equal(t, collection2.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection2, resultCollection, CompareNamespaces), "The collections need to be equal")

}

func TestReplaceWorkloads(t *testing.T) {
	ds, teardownFunc := setupPersistenceTestSuite(t)
	defer teardownFunc(t)

	labels := make(map[string]string)
	labels["managed_by"] = "kdd"
	labels["app"] = "kdd"

	annotations := make(map[string]string)
	annotations["log_format"] = "json"
	annotations["splunk.com/exclude"] = "true"

	selector := make(map[string]string)
	selector["app"] = "daemonset"

	wordpressDeployment := models.DeploymentWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName: "wordpress",
			Namespace:    "website",
			Labels:       labels,
			Annotations:  annotations,
			Selector:     selector,
			Containers: []models.Container{
				{
					ContainerName: "wordpress",
					Image:         "wordpress",
					ImageVersion:  "1.5.2",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: false,
				},
				{
					ContainerName: "init-bash",
					Image:         "bash",
					ImageVersion:  "1.9.2",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: true,
				},
			},
		},
		Status: models.DeploymentStatus{
			Desired:   1,
			Ready:     1,
			Available: 1,
			Up2date:   1,
		},
	}

	filebeatDaemonSet := models.DaemonSetWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName: "filebeat",
			Namespace:    "logging",
			Labels:       labels,
			Annotations:  annotations,
			Selector:     selector,
			Containers: []models.Container{
				{
					ContainerName: "filebeat",
					Image:         "filebeat",
					ImageVersion:  "1.5.2",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: false,
				},
				{
					ContainerName: "filebeat-init",
					Image:         "filebeat-init",
					ImageVersion:  "1.9.2",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: true,
				},
			},
		},
		Status: models.DaemonSetStatus{
			Desired:   3,
			Current:   2,
			Ready:     1,
			Up2date:   2,
			Available: 2,
		},
	}

	bashPod := models.PodWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName: "bash",
			Namespace:    "debugging",
			Labels:       labels,
			Annotations:  annotations,
			Selector:     selector,
			Containers: []models.Container{
				{
					ContainerName: "bash",
					Image:         "bash",
					ImageVersion:  "1.5.2",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: false,
				},
			},
		},
		Status: "Ready",
	}

	mysqlStatefulSet := models.StatefulSetWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName: "mysql",
			Namespace:    "mysql",
			Labels:       labels,
			Annotations:  annotations,
			Selector:     selector,
			Containers: []models.Container{
				{
					ContainerName: "mysql",
					Image:         "mysql",
					ImageVersion:  "8.1",
					RequestCPU:    100,
					RequestMemory: 100,
					LimitCPU:      200,
					LimitMemory:   200,
					InitContainer: false,
				},
			},
		},
		Status: models.StatefulSetStatus{
			Current:   1,
			Ready:     1,
			Up2date:   1,
			Available: 1,
			Replicas:  3,
		},
	}

	collection1 := models.NewCollection()
	collection1.Set("wordpress", wordpressDeployment, true)
	collection1.Set("mysql", mysqlStatefulSet, true)
	collection1.Set("filebeat", filebeatDaemonSet, true)
	collection1.Set("bash-debugging", bashPod, true)

	assert.NoError(t, ds.ReplaceWorkloads(collection1))
	resultCollection, err := ds.GetAllWorkloads()
	assert.NoError(t, err)
	assert.Equal(t, collection1.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection1, resultCollection, CompareWorkloads), "The collections need to be equal")

	collection2 := models.NewCollection()
	collection2.Set("mysql", mysqlStatefulSet, true)
	collection2.Set("filebeat", filebeatDaemonSet, true)
	collection2.Set("bash-debugging", bashPod, true)

	assert.NoError(t, ds.ReplaceWorkloads(collection2))
	resultCollection, err = ds.GetAllWorkloads()
	assert.NoError(t, err)
	assert.Equal(t, collection2.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection2, resultCollection, CompareWorkloads), "The collections need to be equal")
}

func TestUpdateMetrics(t *testing.T) {
	ds, teardownFunc := setupPersistenceTestSuite(t)
	defer teardownFunc(t)

	pod1 := models.PodContainerMetric{
		PodName:           "filebeat-1234",
		Namespace:         "filebeat",
		ContainerName:     "filebeat",
		CPUUsage:          120,
		MemoryUsage:       120,
		CreationTimestamp: time.Now(),
	}
	pod2 := models.PodContainerMetric{
		PodName:           "wordpress-999",
		Namespace:         "wordpress",
		ContainerName:     "wordpress",
		CPUUsage:          150,
		MemoryUsage:       150,
		CreationTimestamp: time.Now(),
	}
	pod3 := models.PodContainerMetric{
		PodName:           "prometheus-999",
		Namespace:         "prom",
		ContainerName:     "prom",
		CPUUsage:          150,
		MemoryUsage:       150,
		CreationTimestamp: time.Now(),
	}

	pod4 := models.PodContainerMetric{
		PodName:           "grafana-9997",
		Namespace:         "grafana",
		ContainerName:     "grafana",
		CPUUsage:          150,
		MemoryUsage:       150,
		CreationTimestamp: time.Now(),
	}

	collection1 := models.NewCollection()
	collection1.Set("pod1", pod1, true)
	collection1.Set("pod2", pod2, true)
	collection1.Set("pod3", pod3, true)

	assert.NoError(t, ds.UpdateMetrics(collection1))
	resultCollection, err := ds.GetAllMetrics()
	assert.NoError(t, err)
	assert.Equal(t, collection1.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection1, resultCollection, CompareContainerMetrics), "The collections need to be equal")

	collection1.Set("pod4", pod4, true)
	assert.NoError(t, ds.UpdateMetrics(collection1))
	resultCollection, err = ds.GetAllMetrics()
	assert.NoError(t, err)
	assert.Equal(t, collection1.Len(), resultCollection.Len())
	assert.True(t, models.CompareCollections(collection1, resultCollection, CompareContainerMetrics), "The collections need to be equal")
}

func TestGetNamespace(t *testing.T) {

	ds, teardownFunc := setupPersistenceTestSuite(t)
	defer teardownFunc(t)

	labels := make(map[string]string)
	labels["managed_by"] = "kdd"
	labels["app"] = "kdd"

	annotations := make(map[string]string)
	annotations["log_format"] = "json"
	annotations["splunk.com/exclude"] = "true"

	defaultNS := models.Namespace{
		Name:              "default",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	kubeSystemNS := models.Namespace{
		Name:              "kube-system",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	monitoringNS := models.Namespace{
		Name:              "monitoring",
		Labels:            labels,
		Annotations:       annotations,
		CreationTimestamp: time.Now(),
	}

	collection1 := models.NewCollection()
	collection1.Set("default", defaultNS, true)
	collection1.Set("kube-system", kubeSystemNS, true)
	collection1.Set("monitoringNS", monitoringNS, true)

	assert.NoError(t, ds.ReplaceNamespaces(collection1))
	resultCollection, err := ds.GetAllNamespaces()
	assert.NoError(t, err)
	assert.Equal(t, collection1.Len(), resultCollection.Len())

	ns, err := ds.GetNamespace("monitoring")
	assert.NoError(t, err)
	assert.Equal(t, "monitoring", ns.Name)

	ns, err = ds.GetNamespace("not-existing")
	assert.Nil(t, ns)
	assert.Error(t, err)
	assert.Equal(t, err.Error(), "namespace not-existing could not be found")
}
