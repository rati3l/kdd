package persistence_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gitlab.com/patrick.erber/kdd/internal/models"
)

func TestReduceMetrics(t *testing.T) {

	metrics := []models.PodContainerMetric{
		{
			PodName:           "a",
			ContainerName:     "a",
			Namespace:         "a",
			CPUUsage:          10,
			MemoryUsage:       15,
			CreationTimestamp: time.Date(2023, time.January, 22, 10, 5, 0, 0, time.UTC),
		},
		{
			PodName:           "a",
			ContainerName:     "a",
			Namespace:         "a",
			CPUUsage:          12,
			MemoryUsage:       16,
			CreationTimestamp: time.Date(2023, time.January, 22, 10, 6, 0, 0, time.UTC),
		},
		{
			PodName:           "a",
			ContainerName:     "a",
			Namespace:         "a",
			CPUUsage:          20,
			MemoryUsage:       20,
			CreationTimestamp: time.Date(2023, time.January, 22, 10, 7, 30, 0, time.UTC),
		},
		{
			PodName:           "a",
			ContainerName:     "a",
			Namespace:         "a",
			CPUUsage:          12,
			MemoryUsage:       16,
			CreationTimestamp: time.Date(2023, time.January, 22, 10, 7, 0, 0, time.UTC),
		},
		{
			PodName:           "a",
			ContainerName:     "a",
			Namespace:         "a",
			CPUUsage:          15,
			MemoryUsage:       13,
			CreationTimestamp: time.Date(2023, time.January, 22, 10, 12, 0, 0, time.UTC),
		},
	}

	result := models.ReduceMetrics(metrics, time.Minute*5)
	assert.Len(t, result, 2)
	assert.Equal(t, int64(20), result[0].CPUUsage)
	assert.Equal(t, int64(20), result[0].MemoryUsage)

	assert.Equal(t, int64(15), result[1].CPUUsage)
	assert.Equal(t, int64(13), result[1].MemoryUsage)
}
