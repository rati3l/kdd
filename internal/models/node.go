package models

import "time"

type Node struct {
	Name              string            `json:"name"`
	Status            string            `json:"status"`
	Cpu               int64             `json:"cpu"`
	Memory            int64             `json:"memory"`
	OsImage           string            `json:"os_image"`
	KubeletVersion    string            `json:"kubelet_version"`
	Roles             string            `json:"roles"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	CreationTimestamp time.Time         `json:"creation_date"`
}
