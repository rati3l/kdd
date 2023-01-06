package models

import "time"

type PodContainerMetric struct {
	PodName           string    `json:"podname"`
	Namespace         string    `json:"namespace"`
	ContainerName     string    `json:"container_name"`
	CPUUsage          int64     `json:"cpu_usage"`
	MemoryUsage       int64     `json:"memory_usage"`
	CreationTimestamp time.Time `json:"creation_date"`
}
