package models

import (
	"encoding/json"
	"time"
)

const (
	WORKLOAD_TYPE_DEPLOYMENT  string = "Deployment"
	WORKLOAD_TYPE_DEAMONSET   string = "Daemonset"
	WORKLOAD_TYPE_STATEFULSET string = "Statefulset"
	WORKLOAD_TYPE_POD         string = "Pod"
	WORKLOAD_TYPE_JOB         string = "Job"
	WORKLOAD_TYPE_CRONJOB     string = "Cronjob"
)

// TODO we should have on generic function to sort by name
// ByWorkloadName implements sort.Interface based on the Workload name field.
type ByWorkloadName []Workload

func (a ByWorkloadName) Len() int           { return len(a) }
func (a ByWorkloadName) Less(i, j int) bool { return a[i].GetWorkloadName() < a[j].GetWorkloadName() }
func (a ByWorkloadName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

type ByContainerMetricsTimestamp []PodContainerMetric

func (a ByContainerMetricsTimestamp) Len() int { return len(a) }
func (a ByContainerMetricsTimestamp) Less(i, j int) bool {
	return a[i].CreationTimestamp.Before(a[j].CreationTimestamp)
}
func (a ByContainerMetricsTimestamp) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

// ByNamespaceName implements sort.Interface based on the Namespace name field.
type ByNamespaceName []Namespace

func (a ByNamespaceName) Len() int           { return len(a) }
func (a ByNamespaceName) Less(i, j int) bool { return a[i].Name < a[j].Name }
func (a ByNamespaceName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

// ByNodeName implements sort.Interface based on the Node name field.
type ByNodeName []Node

func (a ByNodeName) Len() int           { return len(a) }
func (a ByNodeName) Less(i, j int) bool { return a[i].Name < a[j].Name }
func (a ByNodeName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

type Workload interface {
	GetWorkloadName() string
	GetType() string
	GetNamespace() string
	GetContainers() []Container
	GetLabels() map[string]string
	GetAnnotations() map[string]string
	GetSelector() map[string]string
	// I guess it is not the best solution to use interface{} type for returning workload status
	GetWorkloadStatus() interface{}
	GetCreationTimestamp() time.Time
}

// Workload - represents a single workload
type GeneralWorkloadInfo struct {
	WorkloadName      string            `json:"workload_name"` // Name of the Deplyoment or Deamonset
	Namespace         string            `json:"namespace"`     // Namespace
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Selector          map[string]string `json:"selector"`
	Containers        []Container       `json:"containers"` // Containers used by workload
	CreationTimestamp time.Time         `json:"creation_date"`
}

// DeploymentWorkload - represents a deployment workload
type DeploymentWorkload struct {
	GeneralWorkloadInfo `json:"workload_info"`
	Status              DeploymentStatus `json:"status"`
}

func (d DeploymentWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo `json:"workload_info"`
		Status              DeploymentStatus `json:"status"`
		Type                string           `json:"type"`
	}{
		GeneralWorkloadInfo: d.GeneralWorkloadInfo,
		Status:              d.Status,
		Type:                d.GetType(),
	})
}

type DeploymentStatus struct {
	Desired   int `json:"desired"`
	Ready     int `json:"ready"`
	Available int `json:"available"`
	Up2date   int `json:"up2date"`
}

// GetType returns the workload type
func (d DeploymentWorkload) GetType() string {
	return WORKLOAD_TYPE_DEPLOYMENT
}

// GetWorkloadName returns the workload name
func (d DeploymentWorkload) GetWorkloadName() string {
	return d.WorkloadName
}

// GetNamespace returns the workload type
func (d DeploymentWorkload) GetNamespace() string {
	return d.Namespace
}

// GetContainers returns containers
func (d DeploymentWorkload) GetContainers() []Container {
	return d.Containers
}

// GetLabels returns labels
func (d DeploymentWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d DeploymentWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetLabels returns Selector
func (d DeploymentWorkload) GetSelector() map[string]string {
	return d.Selector
}

// GetCreationTimestamp returns annotations
func (d DeploymentWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

func (d DeploymentWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

// DaemonSetWorkload - represents a daemonset workload
type DaemonSetWorkload struct {
	GeneralWorkloadInfo `json:"workload_info"`
	Status              DaemonSetStatus `json:"status"`
}

func (d DaemonSetWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo `json:"workload_info"`
		Status              DaemonSetStatus `json:"status"`
		Type                string          `json:"type"`
	}{
		GeneralWorkloadInfo: d.GeneralWorkloadInfo,
		Status:              d.Status,
		Type:                d.GetType(),
	})
}

// DaemonSetStatus represents the status of a deamonset
type DaemonSetStatus struct {
	Desired   int `json:"desired"`
	Current   int `json:"current"`
	Ready     int `json:"ready"`
	Up2date   int `json:"up2date"`
	Available int `json:"available"`
}

// GetType returns the workload type
func (d DaemonSetWorkload) GetType() string {
	return WORKLOAD_TYPE_DEAMONSET
}

// GetWorkloadName returns the workload name
func (d DaemonSetWorkload) GetWorkloadName() string {
	return d.WorkloadName
}

// GetNamespace returns the workload type
func (d DaemonSetWorkload) GetNamespace() string {
	return d.Namespace
}

// GetContainers returns containers
func (d DaemonSetWorkload) GetContainers() []Container {
	return d.Containers
}

// GetLabels returns labels
func (d DaemonSetWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d DaemonSetWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetLabels returns selector
func (d DaemonSetWorkload) GetSelector() map[string]string {
	return d.Selector
}

// GetCreationTimestamp returns creation timestamp
func (d DaemonSetWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

func (d DaemonSetWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

type StatefulSetWorkload struct {
	GeneralWorkloadInfo `json:"workload_info"`
	Status              StatefulSetStatus `json:"status"`
}

func (d StatefulSetWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo `json:"workload_info"`
		Status              StatefulSetStatus `json:"status"`
		Type                string            `json:"type"`
	}{
		GeneralWorkloadInfo: d.GeneralWorkloadInfo,
		Status:              d.Status,
		Type:                d.GetType(),
	})
}

// StatefulSetStatus represents the status of a statefulset
type StatefulSetStatus struct {
	Current   int `json:"current"`
	Ready     int `json:"ready"`
	Up2date   int `json:"up2date"`
	Available int `json:"available"`
	Replicas  int `json:"replicas"`
}

// GetType returns the workload type
func (s StatefulSetWorkload) GetType() string {
	return WORKLOAD_TYPE_STATEFULSET
}

// GetWorkloadName returns the workload name
func (d StatefulSetWorkload) GetWorkloadName() string {
	return d.WorkloadName
}

// GetNamespace returns the workload type
func (d StatefulSetWorkload) GetNamespace() string {
	return d.Namespace
}

// GetContainers returns containers
func (d StatefulSetWorkload) GetContainers() []Container {
	return d.Containers
}

// GetLabels returns labels
func (d StatefulSetWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d StatefulSetWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetSelector returns selectors
func (d StatefulSetWorkload) GetSelector() map[string]string {
	return d.Selector
}

func (d StatefulSetWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

// GetCreationTimestamp returns creation timestamp
func (d StatefulSetWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

type PodOwnerRessource struct {
	APIVersion string `json:"api_version"`
	Kind       string `json:"kind"`
	UID        string `json:"uid"`
	Name       string `json:"name"`
}

// PodWorkload - represents a pod
type PodWorkload struct {
	GeneralWorkloadInfo `json:"workload_info"`
	Status              string              `json:"status"`
	Restarts            int                 `json:"restarts"`
	PodOwnerRessources  []PodOwnerRessource `json:"pod_owner_ressources"`
}

func (p PodWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo `json:"workload_info"`
		Status              string              `json:"status"`
		Type                string              `json:"type"`
		Restarts            int                 `json:"restarts"`
		PodOwnerRessources  []PodOwnerRessource `json:"pod_owner_ressources"`
	}{
		GeneralWorkloadInfo: p.GeneralWorkloadInfo,
		Status:              p.Status,
		Type:                p.GetType(),
		Restarts:            p.Restarts,
		PodOwnerRessources:  p.PodOwnerRessources,
	})
}

// GetType returns the workload type
func (p PodWorkload) GetType() string {
	return WORKLOAD_TYPE_POD
}

// GetWorkloadName returns the workload name
func (p PodWorkload) GetWorkloadName() string {
	return p.WorkloadName
}

// GetNamespace returns the workload type
func (p PodWorkload) GetNamespace() string {
	return p.Namespace
}

// GetContainers returns pods
func (p PodWorkload) GetContainers() []Container {
	return p.Containers
}

// GetLabels returns labels
func (d PodWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d PodWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetLabels returns selectors
func (d PodWorkload) GetSelector() map[string]string {
	return d.Selector
}

// GetCreationTimestamp returns creation timestamp
func (d PodWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

func (d PodWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

// JobWorkload - represents a job workload
type JobWorkload struct {
	GeneralWorkloadInfo `json:"workload_info"`
	Status              JobStatus `json:"status"`
}

func (d JobWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo `json:"workload_info"`
		Status              JobStatus `json:"status"`
		Type                string    `json:"type"`
	}{
		GeneralWorkloadInfo: d.GeneralWorkloadInfo,
		Status:              d.Status,
		Type:                d.GetType(),
	})
}

type JobStatus struct {
	Active         int32      `json:"active"`
	Ready          *int32     `json:"ready"`
	Failed         int32      `json:"failed"`
	Succeeded      int32      `json:"succeeded"`
	StartTime      *time.Time `json:"start_time"`
	CompletionTime *time.Time `json:"completion_time"`
}

// GetType returns the workload type
func (d JobWorkload) GetType() string {
	return WORKLOAD_TYPE_JOB
}

// GetWorkloadName returns the workload name
func (d JobWorkload) GetWorkloadName() string {
	return d.WorkloadName
}

// GetNamespace returns the workload type
func (d JobWorkload) GetNamespace() string {
	return d.Namespace
}

// GetContainers returns containers
func (d JobWorkload) GetContainers() []Container {
	return d.Containers
}

// GetLabels returns labels
func (d JobWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d JobWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetLabels returns Selector
func (d JobWorkload) GetSelector() map[string]string {
	return d.Selector
}

// GetCreationTimestamp returns annotations
func (d JobWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

func (d JobWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

// CronjobWorkload - represents a Cronjob workload
type CronjobWorkload struct {
	GeneralWorkloadInfo   `json:"workload_info"`
	Suspend               *bool         `json:"suspend"`
	ConcurrencyPolicy     string        `json:"concurrency_policy"`
	BackoffLimit          *int32        `json:"backoff_limit"`
	FailedJobsHistory     *int32        `json:"failed_jobs_history"`
	SuccessfulJobsHistory *int32        `json:"successful_jobs_history"`
	Schedule              string        `json:"schedule"`
	Status                CronjobStatus `json:"status"`
}

func (d CronjobWorkload) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		GeneralWorkloadInfo   `json:"workload_info"`
		Status                CronjobStatus `json:"status"`
		Type                  string        `json:"type"`
		Suspend               *bool         `json:"suspend"`
		ConcurrencyPolicy     string        `json:"concurrency_policy"`
		BackoffLimit          *int32        `json:"backoff_limit"`
		FailedJobsHistory     *int32        `json:"failed_jobs_history"`
		SuccessfulJobsHistory *int32        `json:"successful_jobs_history"`
		Schedule              string        `json:"schedule"`
	}{
		GeneralWorkloadInfo:   d.GeneralWorkloadInfo,
		Status:                d.Status,
		Type:                  d.GetType(),
		Suspend:               d.Suspend,
		ConcurrencyPolicy:     d.ConcurrencyPolicy,
		BackoffLimit:          d.BackoffLimit,
		FailedJobsHistory:     d.FailedJobsHistory,
		SuccessfulJobsHistory: d.SuccessfulJobsHistory,
		Schedule:              d.Schedule,
	})
}

// GetType returns the workload type
func (d CronjobWorkload) GetType() string {
	return WORKLOAD_TYPE_CRONJOB
}

// GetWorkloadName returns the workload name
func (d CronjobWorkload) GetWorkloadName() string {
	return d.WorkloadName
}

// GetNamespace returns the workload type
func (d CronjobWorkload) GetNamespace() string {
	return d.Namespace
}

// GetContainers returns containers
func (d CronjobWorkload) GetContainers() []Container {
	return d.Containers
}

// GetLabels returns labels
func (d CronjobWorkload) GetLabels() map[string]string {
	return d.Labels
}

// GetLabels returns annotations
func (d CronjobWorkload) GetAnnotations() map[string]string {
	return d.Annotations
}

// GetLabels returns Selector
func (d CronjobWorkload) GetSelector() map[string]string {
	return d.Selector
}

// GetCreationTimestamp returns annotations
func (d CronjobWorkload) GetCreationTimestamp() time.Time {
	return d.CreationTimestamp
}

func (d CronjobWorkload) GetWorkloadStatus() interface{} {
	return d.Status
}

type CronjobStatus struct {
	Active             []ActiveCronjobInfo `json:"active_jobs"`
	LastScheduledTime  *time.Time          `json:"last_scheduled_time"`
	LastSuccessfulTime *time.Time          `json:"last_successful_time"`
}

type ActiveCronjobInfo struct {
	APIVersion string `json:"api_version"`
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
}

type Container struct {
	ContainerName string `json:"container_name"` // Container Name
	Image         string `json:"image"`
	ImageVersion  string `json:"image_version"`
	RequestCPU    int64  `json:"request_cpu"`    // Request CPU
	RequestMemory int64  `json:"request_memory"` // Request Memory
	LimitCPU      int64  `json:"limit_cpu"`      // Limit CPU
	LimitMemory   int64  `json:"limit_memory"`   // Limit Memory
	Restarts      int    `json:"restarts"`
	InitContainer bool   `json:"init_container"` // Init Container (yes, no)
}
