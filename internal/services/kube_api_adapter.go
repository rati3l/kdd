package services

import (
	"context"
	"fmt"

	"gitlab.com/patrick.erber/kdd/internal/models"
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
