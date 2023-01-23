package models

import (
	"fmt"
	"sync"
)

type CollectionCompareFunc func(a interface{}, b interface{}) bool
type FilterFunc func(a interface{}) bool

// Collection - thread safe collection which stores data
type Collection struct {
	items map[string]interface{}
	lock  sync.Mutex
}

// Set - adds a key & value to collection
func (c *Collection) Set(key string, value interface{}, replace bool) error {
	c.lock.Lock()
	defer c.lock.Unlock()
	if _, ok := c.items[key]; ok && !replace {
		return fmt.Errorf("key already exists")
	}

	c.items[key] = value

	return nil
}

// Get - returns the provided value
func (c *Collection) Get(key string) (interface{}, bool) {
	c.lock.Lock()
	defer c.lock.Unlock()
	val, ok := c.items[key]
	return val, ok
}

func (c *Collection) GetAll() map[string]interface{} {
	return c.items
}

// Len return the length of the collection
func (c *Collection) Len() int {
	return len(c.items)
}

func (c *Collection) GetKeys() []string {
	keys := make([]string, c.Len())
	i := 0
	for k := range c.items {
		keys[i] = k
		i++
	}

	return keys
}

func (c *Collection) Filter(f FilterFunc) *Collection {
	filteredCollection := NewCollection()
	for key, item := range c.items {
		if f(item) {
			filteredCollection.Set(key, item, true)
		}
	}

	return filteredCollection
}

func (c *Collection) ToList() []interface{} {
	vals := make([]interface{}, c.Len())
	i := 0
	for _, val := range c.items {
		vals[i] = val
		i++
	}
	return vals
}

func CompareCollections(a *Collection, b *Collection, f CollectionCompareFunc) bool {
	if a.Len() != b.Len() {
		return false
	}

	for aKey, aVal := range a.GetAll() {
		found := false
		for bKey, bVal := range b.GetAll() {
			if aKey == bKey && f(aVal, bVal) {
				found = true
				break
			}
		}

		if !found {
			return false
		}
	}

	return true
}

// NewCollection - returns a new collection
func NewCollection() *Collection {
	return &Collection{items: make(map[string]interface{})}
}
