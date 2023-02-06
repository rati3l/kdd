package collector

import (
	"context"
	"fmt"
	"strings"

	"gitlab.com/patrick.erber/kdd/internal/models"
	"go.uber.org/zap"
	core_v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	metrics "k8s.io/metrics/pkg/client/clientset/versioned"
)

/**
The collector package is responsible to collect informations from the workloads deployed in Kubernetes.
*/

type WorkloadCollectorConfig struct {
	ClientSet         *kubernetes.Clientset
	MertricsClientSet *metrics.Clientset
}

// WorkloadCollector
type WorkloadCollector struct {
	cfg *WorkloadCollectorConfig
}

// NewWorkloadCollector creates a new Instance of the collector
func NewWorkloadCollector(cfg *WorkloadCollectorConfig) *WorkloadCollector {
	return &WorkloadCollector{
		cfg: cfg,
	}
}

type CollectorResult struct {
	containerMetricsCollection *models.Collection
	nodeCollection             *models.Collection
	namespaceCollection        *models.Collection
	workloadCollection         *models.Collection
}

func NewCollectorResult() *CollectorResult {
	return &CollectorResult{
		containerMetricsCollection: models.NewCollection(),
		nodeCollection:             models.NewCollection(),
		namespaceCollection:        models.NewCollection(),
		workloadCollection:         models.NewCollection(),
	}
}

func (r *CollectorResult) GetNodeCollection() *models.Collection {
	return r.nodeCollection
}

func (r *CollectorResult) GetContainerMetricsCollection() *models.Collection {
	return r.containerMetricsCollection
}

func (r *CollectorResult) GetNamespaceCollection() *models.Collection {
	return r.namespaceCollection
}

func (r *CollectorResult) GetWorkloadCollection() *models.Collection {
	return r.workloadCollection
}

// Collect - Collects data and returns the list of workloads.
func (w *WorkloadCollector) Collect() (*CollectorResult, error) {
	result := NewCollectorResult()
	zap.L().Debug("start requesting data")

	if err := w.collectNodes(result.nodeCollection); err != nil {
		return nil, err
	}
	if err := w.collectNamspaces(result.namespaceCollection); err != nil {
		return nil, err
	}

	if err := w.collectDeployments(result.workloadCollection); err != nil {
		return nil, err
	}

	if err := w.collectDaemonSets(result.workloadCollection); err != nil {
		return nil, err
	}

	if err := w.collectStatefulSet(result.workloadCollection); err != nil {
		return nil, err
	}

	if err := w.collectPods(result.workloadCollection); err != nil {
		return nil, err
	}

	if err := w.collectContainerMetrics(result.containerMetricsCollection); err != nil {
		return nil, err
	}

	zap.L().Debug("end requesting data")

	return result, nil
}

func (w *WorkloadCollector) collectNodes(collection *models.Collection) error {
	nodesList, err := w.cfg.ClientSet.CoreV1().Nodes().List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, node := range nodesList.Items {

		// get node roels
		var nodeRoles string
		for key := range node.Labels {
			if strings.HasPrefix(key, "node-role") {
				// avoid having space with only single role
				if len(nodeRoles) > 0 {
					nodeRoles += " " + strings.Split(key, "/")[1]
				} else {
					nodeRoles += strings.Split(key, "/")[1]
				}
			}
		}

		// get node status
		var status string
		for _, condition := range node.Status.Conditions {
			if condition.Type == "Ready" {
				status = condition.Reason
			}
		}

		// cast cpu to an usable value
		cpu, _ := node.Status.Capacity.Cpu().AsInt64()

		collection.Set(node.Name, models.Node{
			Name:              node.Name,
			Cpu:               cpu,
			Memory:            node.Status.Capacity.Memory().ScaledValue(resource.Mega),
			OsImage:           node.Status.NodeInfo.OSImage,
			KubeletVersion:    node.Status.NodeInfo.KubeletVersion,
			CreationTimestamp: node.CreationTimestamp.Time,
			Status:            status,
			Roles:             nodeRoles,
			Labels:            node.Labels,
			Annotations:       node.Annotations,
		}, false)
	}

	return nil
}

// collectNamespaces this function is responsible to collect namespaces
func (w *WorkloadCollector) collectNamspaces(collection *models.Collection) error {
	namespaces := w.cfg.ClientSet.CoreV1().Namespaces()
	nsList, err := namespaces.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, item := range nsList.Items {
		collection.Set(item.Name, models.Namespace{
			CreationTimestamp: item.CreationTimestamp.Time,
			Status:            string(item.Status.Phase),
			Name:              item.Name,
			Labels:            item.Labels,
			Annotations:       item.Annotations,
		}, false)
	}

	return nil
}

func (w *WorkloadCollector) collectDeployments(collection *models.Collection) error {
	deploymentsClient := w.cfg.ClientSet.AppsV1().Deployments(v1.NamespaceAll)
	deploymentList, err := deploymentsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, deployment := range deploymentList.Items {
		listOfContainers := deployment.Spec.Template.Spec.Containers
		listOfInitContainers := deployment.Spec.Template.Spec.InitContainers
		containers := w.buildContainerList(listOfContainers, listOfInitContainers, nil)

		err := collection.Set(fmt.Sprintf("%s_%s", deployment.ObjectMeta.Namespace, deployment.Name), models.DeploymentWorkload{
			GeneralWorkloadInfo: models.GeneralWorkloadInfo{
				Namespace:         deployment.ObjectMeta.Namespace,
				WorkloadName:      deployment.Name,
				Labels:            deployment.Labels,
				Annotations:       deployment.Annotations,
				Selector:          deployment.Spec.Selector.MatchLabels,
				Containers:        containers,
				CreationTimestamp: deployment.CreationTimestamp.Time,
			},
			Status: models.DeploymentStatus{
				Desired:   int(*deployment.Spec.Replicas),
				Ready:     int(deployment.Status.ReadyReplicas),
				Available: int(deployment.Status.AvailableReplicas),
				Up2date:   int(deployment.Status.UpdatedReplicas),
			},
		}, false)

		if err != nil {
			zap.L().Error("workload could not be added to workload collection")
		}
	}

	return nil
}

func (w *WorkloadCollector) collectDaemonSets(collection *models.Collection) error {
	daemonSetsClient := w.cfg.ClientSet.AppsV1().DaemonSets(v1.NamespaceAll)
	daemonsetList, err := daemonSetsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, daemonset := range daemonsetList.Items {
		listOfContainers := daemonset.Spec.Template.Spec.Containers
		listOfInitContainers := daemonset.Spec.Template.Spec.InitContainers
		containers := w.buildContainerList(listOfContainers, listOfInitContainers, nil)

		err := collection.Set(fmt.Sprintf("%s_%s", daemonset.ObjectMeta.Namespace, daemonset.Name), models.DaemonSetWorkload{
			GeneralWorkloadInfo: models.GeneralWorkloadInfo{
				Namespace:         daemonset.ObjectMeta.Namespace,
				WorkloadName:      daemonset.Name,
				Labels:            daemonset.Labels,
				Annotations:       daemonset.Annotations,
				Selector:          daemonset.Spec.Selector.MatchLabels,
				Containers:        containers,
				CreationTimestamp: daemonset.CreationTimestamp.Time,
			},
			Status: models.DaemonSetStatus{
				Desired: int(daemonset.Status.DesiredNumberScheduled),
				Current: int(daemonset.Status.CurrentNumberScheduled),
				Ready:   int(daemonset.Status.NumberReady),
				Up2date: int(daemonset.Status.UpdatedNumberScheduled),
			},
		}, false)

		if err != nil {
			zap.L().Error("workload could not be added to workload collection")
		}
	}

	return nil
}

func (w *WorkloadCollector) collectStatefulSet(collection *models.Collection) error {
	statefulSetClient := w.cfg.ClientSet.AppsV1().StatefulSets(v1.NamespaceAll)
	statefuleSetList, err := statefulSetClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, statefulSet := range statefuleSetList.Items {
		listOfContainers := statefulSet.Spec.Template.Spec.Containers
		listOfInitContainers := statefulSet.Spec.Template.Spec.InitContainers
		containers := w.buildContainerList(listOfContainers, listOfInitContainers, nil)

		err := collection.Set(fmt.Sprintf("%s_%s", statefulSet.ObjectMeta.Namespace, statefulSet.Name), models.StatefulSetWorkload{
			GeneralWorkloadInfo: models.GeneralWorkloadInfo{
				Namespace:         statefulSet.ObjectMeta.Namespace,
				WorkloadName:      statefulSet.Name,
				Labels:            statefulSet.Labels,
				Annotations:       statefulSet.Annotations,
				Selector:          statefulSet.Spec.Selector.MatchLabels,
				Containers:        containers,
				CreationTimestamp: statefulSet.CreationTimestamp.Time,
			},
			Status: models.StatefulSetStatus{
				Available: int(statefulSet.Status.AvailableReplicas),
				Current:   int(statefulSet.Status.CurrentReplicas),
				Up2date:   int(statefulSet.Status.UpdatedReplicas),
				Replicas:  int(statefulSet.Status.Replicas),
				Ready:     int(statefulSet.Status.ReadyReplicas),
			},
		}, false)

		if err != nil {
			zap.L().Error("workload could not be added to workload collection")
		}
	}

	return nil
}

func (w *WorkloadCollector) collectPods(collection *models.Collection) error {
	podsClient := w.cfg.ClientSet.CoreV1().Pods(v1.NamespaceAll)
	podsList, err := podsClient.List(context.TODO(), v1.ListOptions{})
	if err != nil {
		return err
	}

	for _, pod := range podsList.Items {
		listOfContainers := pod.Spec.Containers
		listOfInitContainers := pod.Spec.InitContainers
		containers := w.buildContainerList(listOfContainers, listOfInitContainers, pod.Status.ContainerStatuses)

		restarts := int32(0)
		for _, containerStatus := range pod.Status.ContainerStatuses {
			if restarts < containerStatus.RestartCount {
				restarts = containerStatus.RestartCount
			}
		}

		err := collection.Set(fmt.Sprintf("%s_%s", pod.ObjectMeta.Namespace, pod.Name), models.PodWorkload{
			GeneralWorkloadInfo: models.GeneralWorkloadInfo{
				Namespace:         pod.ObjectMeta.Namespace,
				WorkloadName:      pod.Name,
				Labels:            pod.Labels,
				Annotations:       pod.Annotations,
				Containers:        containers,
				CreationTimestamp: pod.CreationTimestamp.Time,
			},
			Status:   string(pod.Status.Phase),
			Restarts: int(restarts),
		}, false)

		if err != nil {
			zap.L().Error("workload could not be added to workload collection")
		}
	}

	return nil
}

func (*WorkloadCollector) buildContainerList(listOfContainers []core_v1.Container, listOfInitContainers []core_v1.Container, containerStatuses []core_v1.ContainerStatus) []models.Container {
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

func (w *WorkloadCollector) collectContainerMetrics(collection *models.Collection) error {
	metrics, err := w.cfg.MertricsClientSet.MetricsV1beta1().PodMetricses(v1.NamespaceAll).List(context.TODO(), v1.ListOptions{})
	if err != nil {
		zap.L().Error("could not load metrics data", zap.Error(err))
		return nil
	}

	for _, podMetric := range metrics.Items {
		for _, container := range podMetric.Containers {
			//cpu := container.Usage.Cpu().AsDec().UnscaledBig().Int64()
			cpu := container.Usage.Cpu().MilliValue()
			memory := container.Usage.Memory().AsDec().UnscaledBig().Int64()

			err := collection.Set(fmt.Sprintf("%s_%s_%s", podMetric.Namespace, podMetric.Name, container.Name), models.PodContainerMetric{
				PodName:           podMetric.Name,
				Namespace:         podMetric.Namespace,
				CreationTimestamp: podMetric.CreationTimestamp.Time,
				ContainerName:     container.Name,
				CPUUsage:          cpu,
				MemoryUsage:       memory,
			}, false)

			if err != nil {
				zap.L().Error("workload could not be added to workload collection")
			}
		}
	}

	return nil
}
