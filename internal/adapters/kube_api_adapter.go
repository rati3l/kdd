package adapters

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.com/patrick.erber/kdd/internal/models"
	batch_v1 "k8s.io/api/batch/v1"
	core_v1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type KubeAPIAdapterConfig struct {
	ClientSet *kubernetes.Clientset
}

type KubeAPIAdapter struct {
	cfg *KubeAPIAdapterConfig
}

func NewKubeAPIAdapter(cfg *KubeAPIAdapterConfig) *KubeAPIAdapter {
	return &KubeAPIAdapter{cfg: cfg}
}

func (a *KubeAPIAdapter) GetEventsForNamespace(namespace string) (*models.Collection, error) {
	collection := models.NewCollection()
	eventsClient := a.cfg.ClientSet.CoreV1().Events(namespace)
	result, err := eventsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return nil, err
	}
	for _, event := range result.Items {
		e := models.Event{
			LastSeen:  event.LastTimestamp.Time,
			FirstSeen: event.FirstTimestamp.Time,
			Count:     uint64(event.Count),
			Name:      event.Name,
			Namespace: event.Namespace,
			Type:      event.Type,
			Reason:    event.Reason,
			Message:   event.Message,
			Object:    fmt.Sprintf("%s/%s", event.InvolvedObject.Kind, event.InvolvedObject.Name),
			Source:    fmt.Sprintf("%s, %s", event.Source.Component, event.Source.Host),
		}
		collection.Set(fmt.Sprintf("%s_%s_%s", event.InvolvedObject.Name, event.Namespace, event.Reason), e, true)
	}

	return collection, nil
}

func (a *KubeAPIAdapter) GetCronjobs(namespace string) (*models.Collection, error) {
	collection := models.NewCollection()

	if namespace == "" {
		namespace = v1.NamespaceAll
	}

	jobsClient := a.cfg.ClientSet.BatchV1().CronJobs(namespace)
	result, err := jobsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return nil, err
	}
	for _, job := range result.Items {
		w := a.createWorkloadObjectFromCronjob(&job)
		collection.Set(fmt.Sprintf("cronjob_%s_%s", job.GetName(), job.GetNamespace()), w, true)
	}

	return collection, nil
}

func (a *KubeAPIAdapter) createWorkloadObjectFromCronjob(job *batch_v1.CronJob) models.Workload {
	listOfContainers := job.Spec.JobTemplate.Spec.Template.Spec.Containers
	listOfInitContainers := job.Spec.JobTemplate.Spec.Template.Spec.InitContainers
	containers := a.buildContainerList(listOfContainers, listOfInitContainers, nil)

	var lastScheduledTime *time.Time
	var lastSuccessfulTime *time.Time

	selector := make(map[string]string)
	if job.Status.LastScheduleTime != nil {
		lastScheduledTime = &job.Status.LastScheduleTime.Time
	}

	if job.Status.LastSuccessfulTime != nil {
		lastSuccessfulTime = &job.Status.LastSuccessfulTime.Time
	}

	if job.Spec.JobTemplate.Spec.Selector != nil {
		selector = job.Spec.JobTemplate.Spec.Selector.MatchLabels
	}

	activeJobs := make([]models.ActiveCronjobInfo, len(job.Status.Active))
	for i, cj := range job.Status.Active {
		activeJobs[i] = models.ActiveCronjobInfo{
			APIVersion: cj.APIVersion,
			Name:       cj.Name,
			Namespace:  cj.Namespace,
		}
	}

	w := models.CronjobWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName:      job.GetObjectMeta().GetName(),
			Namespace:         job.GetNamespace(),
			Labels:            job.Labels,
			Annotations:       job.Annotations,
			Selector:          selector,
			Containers:        containers,
			CreationTimestamp: job.CreationTimestamp.Time,
		},
		ConcurrencyPolicy:     string(job.Spec.ConcurrencyPolicy),
		BackoffLimit:          job.Spec.JobTemplate.Spec.BackoffLimit,
		FailedJobsHistory:     job.Spec.FailedJobsHistoryLimit,
		SuccessfulJobsHistory: job.Spec.SuccessfulJobsHistoryLimit,
		Suspend:               job.Spec.Suspend,
		Schedule:              job.Spec.Schedule,
		Status: models.CronjobStatus{
			Active:             activeJobs,
			LastScheduledTime:  lastScheduledTime,
			LastSuccessfulTime: lastSuccessfulTime,
		},
	}

	return w
}

func (a *KubeAPIAdapter) GetJobs(namespace string) (*models.Collection, error) {
	collection := models.NewCollection()

	if namespace == "" {
		namespace = v1.NamespaceAll
	}

	jobsClient := a.cfg.ClientSet.BatchV1().Jobs(namespace)
	result, err := jobsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return nil, err
	}
	for _, job := range result.Items {
		w := a.createWorkloadObjectFromJob(&job)
		collection.Set(fmt.Sprintf("job_%s_%s", job.GetName(), job.GetNamespace()), w, true)
	}

	return collection, nil
}

func (a *KubeAPIAdapter) createWorkloadObjectFromJob(job *batch_v1.Job) models.Workload {
	listOfContainers := job.Spec.Template.Spec.Containers
	listOfInitContainers := job.Spec.Template.Spec.InitContainers
	containers := a.buildContainerList(listOfContainers, listOfInitContainers, nil)

	var startTime *time.Time
	var completionTime *time.Time

	if job.Status.StartTime != nil {
		startTime = &job.Status.StartTime.Time
	}

	if job.Status.CompletionTime != nil {
		completionTime = &job.Status.CompletionTime.Time
	}

	w := models.JobWorkload{
		GeneralWorkloadInfo: models.GeneralWorkloadInfo{
			WorkloadName:      job.GetObjectMeta().GetName(),
			Namespace:         job.GetNamespace(),
			Labels:            job.Labels,
			Annotations:       job.Annotations,
			Selector:          job.Spec.Selector.MatchLabels,
			Containers:        containers,
			CreationTimestamp: job.CreationTimestamp.Time,
		},
		Status: models.JobStatus{
			Active:         job.Status.Active,
			Ready:          job.Status.Ready,
			Failed:         job.Status.Failed,
			Succeeded:      job.Status.Succeeded,
			StartTime:      startTime,
			CompletionTime: completionTime,
		},
	}

	return w
}

func (a *KubeAPIAdapter) GetWorkloadBy(filters map[string]string) (models.Workload, error) {
	namespace := ""
	workloadType := ""
	workloadName := ""

	if v, ok := filters["namespace"]; ok {
		namespace = v
	} else {
		return nil, fmt.Errorf("namespace parameter is required")
	}

	if v, ok := filters["workload_name"]; ok {
		workloadName = v
	} else {
		return nil, fmt.Errorf("workload_name parameter is required")
	}

	if v, ok := filters["workload_type"]; ok {
		workloadType = v
	} else {
		return nil, fmt.Errorf("workload_type parameter is required")
	}

	switch workloadType {
	case models.WORKLOAD_TYPE_JOB:
		jobsClient := a.cfg.ClientSet.BatchV1().Jobs(namespace)
		result, err := jobsClient.Get(context.TODO(), workloadName, v1.GetOptions{})
		if err != nil {
			return nil, err
		}

		return a.createWorkloadObjectFromJob(result), nil
	case models.WORKLOAD_TYPE_CRONJOB:
		jobsClient := a.cfg.ClientSet.BatchV1().CronJobs(namespace)
		result, err := jobsClient.Get(context.TODO(), workloadName, v1.GetOptions{})
		if err != nil {
			return nil, err
		}

		return a.createWorkloadObjectFromCronjob(result), nil
	}

	return nil, fmt.Errorf("unsupported type found")
}

func (a *KubeAPIAdapter) buildContainerList(listOfContainers []core_v1.Container, listOfInitContainers []core_v1.Container, containerStatuses []core_v1.ContainerStatus) []models.Container {
	containers := make([]models.Container, len(listOfContainers)+len(listOfInitContainers))
	for i, container := range listOfContainers {
		imageParts := strings.Split(container.Image, ":")
		if len(imageParts) == 1 {
			imageParts = append(imageParts, "latest")
		}

		restarts := 0
		for _, containerStatus := range containerStatuses {
			if container.Name == containerStatus.Name {
				restarts = int(containerStatus.RestartCount)
			}
		}

		containers[i] = models.Container{
			Image:         imageParts[0],
			ImageVersion:  imageParts[1],
			ContainerName: container.Name,
			LimitCPU:      container.Resources.Limits.Cpu().MilliValue(),
			LimitMemory:   container.Resources.Limits.Memory().Value(),
			RequestCPU:    container.Resources.Requests.Cpu().MilliValue(),
			RequestMemory: container.Resources.Requests.Memory().Value(),
			Restarts:      restarts,
			InitContainer: false,
		}
	}

	for i, container := range listOfInitContainers {
		imageParts := strings.Split(container.Image, ":")
		if len(imageParts) == 1 {
			imageParts = append(imageParts, "latest")
		}
		containers[len(listOfContainers)+i] = models.Container{
			Image:         imageParts[0],
			ImageVersion:  imageParts[1],
			ContainerName: container.Name,
			LimitCPU:      container.Resources.Limits.Cpu().MilliValue(),
			LimitMemory:   container.Resources.Limits.Memory().Value(),
			RequestCPU:    container.Resources.Requests.Cpu().MilliValue(),
			RequestMemory: container.Resources.Requests.Memory().Value(),
			InitContainer: true,
		}
	}
	return containers
}
