package models

import "time"

type Namespace struct {
	Name              string            `json:"name"`
	Status            string            `json:"status"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	CreationTimestamp time.Time         `json:"creation_date"`
}
