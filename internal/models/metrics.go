package models

import (
	"fmt"
	"time"
)

type PodContainerMetric struct {
	PodName           string    `json:"podname"`
	Namespace         string    `json:"namespace"`
	ContainerName     string    `json:"container_name"`
	CPUUsage          int64     `json:"cpu_usage"`
	MemoryUsage       int64     `json:"memory_usage"`
	CreationTimestamp time.Time `json:"creation_date"`
}

func ReduceMetrics(metrics []PodContainerMetric, rate time.Duration) []PodContainerMetric {
	result := make([]PodContainerMetric, 0)
	tmp := make(map[string][]PodContainerMetric)

	/**
		Iterate through result and split it up by pod & container name.
	**/

	for _, metric := range metrics {
		key := fmt.Sprintf("%s_%s", metric.PodName, metric.ContainerName)
		if _, ok := tmp[key]; !ok {
			tmp[key] = make([]PodContainerMetric, 0)
		}

		tmp[key] = append(tmp[key], metric)
	}

	/**
		go through pod & containers, and finding max values within rate
	**/

	for _, podContainers := range tmp {
		/**
			Get First Value
		**/
		if len(podContainers) > 0 {
			startDate := podContainers[0].CreationTimestamp
			lastMetric := podContainers[0]
			for _, metric := range podContainers {
				/**
					if the timespan is created than the provided rate
					we need to store the new date in startDate to have the beginning for the sequence again.
					the last metric with the higher value needs than to be added to the result list.
				**/

				diff := metric.CreationTimestamp.Sub(startDate)
				if diff > rate {
					result = append(result, lastMetric)
					startDate = metric.CreationTimestamp
					/**
						Setting lastMetric to first value!
					**/
					lastMetric = metric
				}

				// What need to be taken?
				// Or maybe it should get split by memory & cpu
				// when cpu usage is higher or when memusage is higher or
				// we take two values? with the highest cpu & memory

				if metric.CPUUsage > lastMetric.CPUUsage || metric.MemoryUsage > lastMetric.MemoryUsage {
					lastMetric = metric
				}
			}

			/**
				Add the last metric to the list
			**/
			result = append(result, lastMetric)
		}
	}

	return result
}
