package controller

import (
	"sync"
	"time"

	"gitlab.com/patrick.erber/kdd/internal/collector"
	"gitlab.com/patrick.erber/kdd/internal/persistence"
	"go.uber.org/zap"
)

/**
	controller package is responsible to manage the syncing interval & provides informationen for prometheus endpoints.
**/

// Controller - Managing the application
type Controller struct {
	started  bool
	lock     sync.Mutex
	wlc      *collector.WorkloadCollector
	ds       *persistence.DataStore
	interval time.Duration
}

// NewController create a new controller Instance
func NewController(wlc *collector.WorkloadCollector, ds *persistence.DataStore, interval time.Duration) *Controller {
	return &Controller{
		wlc:      wlc,
		interval: interval,
		ds:       ds,
	}
}

// Run starts the controller for retrieving workloads
func (c *Controller) Run(done <-chan struct{}) {
	if c.hasStarted() {
		zap.L().Fatal("controller - already started.")
	}
	wg := sync.WaitGroup{}
	wg.Add(1)
	c.start()
	go func(<-chan struct{}) {
		defer wg.Done()
		zap.L().Debug("start collecting initial data")
		res, err := c.wlc.Collect()
		c.ds.ReplaceNamespaces(res.GetNamespaceCollection())
		c.ds.ReplaceWorkloads(res.GetWorkloadCollection())
		c.ds.UpdateMetrics(res.GetContainerMetricsCollection())
		if err != nil {
			zap.L().Error("could not fetch data from kubernetes", zap.Error(err))
		} else {
			zap.L().Debug("finished collecting initial data")
		}

		ticker := time.NewTicker(c.interval)
		for {
			select {
			case <-done:
				zap.L().Debug("shutting down collector")
				ticker.Stop()
				return
			case <-ticker.C:
				zap.L().Debug("start collecting data")
				_, err := c.wlc.Collect()
				c.ds.ReplaceNamespaces(res.GetNamespaceCollection())
				c.ds.ReplaceWorkloads(res.GetWorkloadCollection())
				c.ds.UpdateMetrics(res.GetContainerMetricsCollection())
				if err != nil {
					zap.L().Error("could not fetch data from kubernetes", zap.Error(err))
				} else {
					zap.L().Debug("finished collecting initial data")
				}
				zap.L().Debug("finished collecting data")
			}
		}
	}(done)
	wg.Wait()
	c.stop()
}

// hasStarted checks if the controller is already started
func (c *Controller) hasStarted() bool {
	c.lock.Lock()
	defer c.lock.Unlock()
	return c.started
}

// start starts the controller
func (c *Controller) start() {
	c.lock.Lock()
	defer c.lock.Unlock()
	c.started = true
}

// stop stops the controller
func (c *Controller) stop() {
	c.lock.Lock()
	defer c.lock.Unlock()
	c.started = false
}
