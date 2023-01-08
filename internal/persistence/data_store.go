package persistence

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"gitlab.com/patrick.erber/kdd/internal/models"
	"go.uber.org/zap"
)

/**
 This package is used for our long time storage.
 Beside the different workloads, we will store for one week the metrics of the current pods.

**/

type DataStore struct {
	db *sql.DB
}

const sqlite3_schema string = `
CREATE TABLE IF NOT EXISTS namespaces (
	key TEXT NOT NULL PRIMARY KEY,
	name TEXT NOT NULL, 
	labels TEXT NOT NULL, 
	annotations TEXT NOT NULL,
	creation_timestamp INTEGER NOT NULL
); 
CREATE TABLE IF NOT EXISTS workloads (
	key TEXT NOT NULL PRIMARY KEY,
	workload_name TEXT NOT NULL, 
	workload_type TEXT NOT NULL,
	annotations TEXT NOT NULL,
	namespace TEXT NOT NULL, 
	labels TEXT NOT NULL,
	selector TEXT NOT NULL,
	containers TEXT NOT NULL,
	status TEXT NOT NULL, 
	creation_timestamp INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS container_metrics (
	key TEXT NOT NULL,
	pod_name TEXT NOT NULL, 
	namespace TEXT NOT NULL,
	container_name TEXT NOT NULL, 
	cpu_usage INTEGER NOT NULL, 
	memory_usage INTEGER NOT NULL,
	creation_timestamp INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_namespaces_name ON namespaces(name);
CREATE INDEX IF NOT EXISTS idx_workloads_namespacename ON workloads(namespace);
CREATE INDEX IF NOT EXISTS idx_container_metrics_pod_name ON container_metrics(pod_name);
CREATE INDEX IF NOT EXISTS idx_container_metrics_container_name ON container_metrics(container_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_container_metrics_unique_key_creation_timestamp ON container_metrics(key, creation_timestamp)`

// NewSQLiteDataStore creates a new instance of the data store.
func NewSQLiteDataStore(filename string) (*DataStore, error) {
	db, err := sql.Open("sqlite3", filename)
	if err != nil {
		return nil, err
	}

	// dirty workaround to call the commands separated.
	// This can be fixed by go-sqlite3 package
	for _, q := range strings.Split(sqlite3_schema, ";") {
		stmt, err := db.Prepare(q)
		if err != nil {
			return nil, err
		}

		if _, err := stmt.Exec(); err != nil {
			return nil, err
		}
	}

	return &DataStore{
		db: db,
	}, nil
}

func (d *DataStore) ReplaceNamespaces(collection *models.Collection) error {
	cntFields := 5
	sqlStmtHead := "REPLACE INTO namespaces (key, name, labels, annotations, creation_timestamp) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?)"
	rows := collection.Len()
	values := make([]any, rows*cntFields)
	i := 0
	for key, value := range collection.GetAll() {
		namespace := value.(models.Namespace)
		labels, err := json.Marshal(namespace.Labels)
		if err != nil {
			return err
		}
		annotations, err := json.Marshal(namespace.Annotations)
		if err != nil {
			return err
		}
		creationTimestamp := namespace.CreationTimestamp.Unix()

		values[i] = key
		values[i+1] = namespace.Name
		values[i+2] = string(labels)
		values[i+3] = string(annotations)
		values[i+4] = strconv.FormatInt(creationTimestamp, 10)
		// increase step by 5
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		return err
	}

	return d.cleanUpAfterReplace("namespaces", collection.GetKeys())
}

func (d *DataStore) GetAllNamespaces() (*models.Collection, error) {
	collection := models.NewCollection()
	sqlStmt := "SELECT key, name, labels, annotations, creation_timestamp FROM namespaces"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		var key string
		var name string
		var creationTimestamp int64
		var rawLabels []byte
		var rawAnnotations []byte
		labels := make(map[string]string)
		annotations := make(map[string]string)

		if err := rows.Scan(&key, &name, &rawLabels, &rawAnnotations, &creationTimestamp); err != nil {
			zap.L().Error("Could not scan result from sqllite database", zap.Error(err))
			return nil, err
		}
		if err := json.Unmarshal(rawLabels, &labels); err != nil {
			zap.L().Error("could not unmarshal labels", zap.Error(err))
			continue
		}

		if err := json.Unmarshal(rawAnnotations, &annotations); err != nil {
			zap.L().Error("could not unmarshal annotations", zap.Error(err))
			continue
		}
		ns := models.Namespace{
			Name:              name,
			Labels:            labels,
			Annotations:       annotations,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}

		collection.Set(key, ns, false)
	}

	return collection, nil

}

func (d *DataStore) GetNamespace(name string) (*models.Namespace, error) {
	sqlStmt := "SELECT key, name, labels, annotations, creation_timestamp FROM namespaces WHERE name=? LIMIT 1"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query(name)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	if rows.Next() {
		var key string
		var name string
		var creationTimestamp int64
		var rawLabels []byte
		var rawAnnotations []byte
		labels := make(map[string]string)
		annotations := make(map[string]string)

		if err := rows.Scan(&key, &name, &rawLabels, &rawAnnotations, &creationTimestamp); err != nil {
			zap.L().Error("Could not scan result from sqllite database", zap.Error(err))
			return nil, err
		}
		if err := json.Unmarshal(rawLabels, &labels); err != nil {
			zap.L().Error("could not unmarshal labels", zap.Error(err))
			return nil, err
		}

		if err := json.Unmarshal(rawAnnotations, &annotations); err != nil {
			zap.L().Error("could not unmarshal annotations", zap.Error(err))
			return nil, err
		}
		return &models.Namespace{
			Name:              name,
			Labels:            labels,
			Annotations:       annotations,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}, nil
	}

	return nil, fmt.Errorf(fmt.Sprintf("namespace %s could not be found", name))

}

func (d *DataStore) ReplaceWorkloads(collection *models.Collection) error {
	cntFields := 10
	sqlStmtHead := "REPLACE INTO workloads (key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, creation_timestamp) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	rows := collection.Len()
	values := make([]any, rows*cntFields)
	i := 0
	for key, value := range collection.GetAll() {
		workload := value.(models.Workload)
		labels, err := json.Marshal(workload.GetLabels())
		if err != nil {
			return err
		}
		annotations, err := json.Marshal(workload.GetAnnotations())
		if err != nil {
			return err
		}
		selector, err := json.Marshal(workload.GetSelector())
		if err != nil {
			return err
		}
		containers, err := json.Marshal(workload.GetContainers())
		if err != nil {
			return err
		}
		status, err := json.Marshal(workload.GetWorkloadStatus())
		if err != nil {
			return err
		}
		creationTimestamp := workload.GetCreationTimestamp().Unix()

		values[i] = key
		values[i+1] = workload.GetWorkloadName()
		values[i+2] = workload.GetType()
		values[i+3] = workload.GetNamespace()
		values[i+4] = string(labels)
		values[i+5] = string(annotations)
		values[i+6] = string(selector)
		values[i+7] = string(containers)
		values[i+8] = string(status)
		values[i+9] = strconv.FormatInt(creationTimestamp, 10)
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		return err
	}

	return d.cleanUpAfterReplace("workloads", collection.GetKeys())
}

func (d *DataStore) GetAllWorkloads() (*models.Collection, error) {
	collection := models.NewCollection()
	sqlStmt := "SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, creation_timestamp FROM workloads"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		var key string
		var workloadName string
		var workloadType string
		var namespace string
		var rawLabels []byte
		var rawAnnotations []byte
		var rawSelector []byte
		var rawContainers []byte
		var rawStatus []byte
		var creationTimestamp int
		containers := make([]models.Container, 0)
		labels := make(map[string]string)
		annotations := make(map[string]string)
		selector := make(map[string]string)

		if err := rows.Scan(&key, &workloadName, &workloadType, &namespace, &rawLabels, &rawAnnotations, &rawSelector, &rawContainers, &rawStatus, &creationTimestamp); err != nil {
			zap.L().Error("Could not scan result from sqllite database", zap.Error(err))
			return nil, err
		}
		if err := json.Unmarshal(rawLabels, &labels); err != nil {
			zap.L().Error("could not unmarshal labels", zap.Error(err))
			continue
		}
		if err := json.Unmarshal(rawAnnotations, &annotations); err != nil {
			zap.L().Error("could not unmarshal annotations", zap.Error(err))
			continue
		}
		if err := json.Unmarshal(rawSelector, &selector); err != nil {
			zap.L().Error("could not unmarshal selector", zap.Error(err))
			continue
		}
		if err := json.Unmarshal(rawContainers, &containers); err != nil {
			zap.L().Error("could not unmarshal containers", zap.Error(err))
			continue
		}

		workloadInfo := models.GeneralWorkloadInfo{
			WorkloadName:      workloadName,
			Namespace:         namespace,
			Labels:            labels,
			Annotations:       annotations,
			Selector:          selector,
			Containers:        containers,
			CreationTimestamp: time.Unix(int64(creationTimestamp), 0),
		}

		switch workloadType {
		case models.WORKLOAD_TYPE_DEPLOYMENT:
			var status models.DeploymentStatus
			if err := json.Unmarshal(rawStatus, &status); err != nil {
				zap.L().Error("could not unmarshal status object", zap.Error(err))
				continue
			}
			wl := models.DeploymentWorkload{
				GeneralWorkloadInfo: workloadInfo,
				Status:              status,
			}
			collection.Set(key, wl, false)
		case models.WORKLOAD_TYPE_DEAMONSET:
			var status models.DaemonSetStatus
			if err := json.Unmarshal(rawStatus, &status); err != nil {
				zap.L().Error("could not unmarshal status object", zap.Error(err))
				continue
			}
			wl := models.DaemonSetWorkload{
				GeneralWorkloadInfo: workloadInfo,
				Status:              status,
			}
			collection.Set(key, wl, false)
		case models.WORKLOAD_TYPE_STATEFULSET:
			var status models.StatefulSetStatus
			if err := json.Unmarshal(rawStatus, &status); err != nil {
				zap.L().Error("could not unmarshal status object", zap.Error(err))
				continue
			}
			wl := models.StatefulSetWorkload{
				GeneralWorkloadInfo: workloadInfo,
				Status:              status,
			}
			collection.Set(key, wl, false)
		case models.WORKLOAD_TYPE_POD:
			var status string
			if err := json.Unmarshal(rawStatus, &status); err != nil {
				zap.L().Error("could not unmarshal status object", zap.Error(err))
				continue
			}
			wl := models.PodWorkload{
				GeneralWorkloadInfo: workloadInfo,
				Status:              status,
			}
			collection.Set(key, wl, false)
		default:
			zap.L().Error(fmt.Sprintf("unsupported type: %s", workloadType))
		}
	}

	return collection, nil
}

func (d *DataStore) replace(sqlStmtHead string, sqlStmtVals string, rows int, values []any) error {
	// Preparing replace query and execute.
	var querySb strings.Builder
	querySb.WriteString(sqlStmtHead)

	for i := 0; i < rows; i++ {
		querySb.WriteString(sqlStmtVals)
		if i != rows-1 {
			querySb.WriteString(", ")
		} else {
			querySb.WriteRune('\n')
		}
	}

	stmt, err := d.db.Prepare(querySb.String())
	if err != nil {
		return err
	}

	if _, err := stmt.Exec(values...); err != nil {
		return err
	}

	return nil
}

func (d *DataStore) cleanUpAfterReplace(tableName string, values []string) error {
	cnt := len(values)
	var querySb strings.Builder

	// creates placeholder for delete query
	for i := 0; i < cnt; i++ {
		querySb.WriteRune('?')
		if i != cnt-1 {
			querySb.WriteString(", ")
		}
	}

	// preparing & execute cleanup query
	query := fmt.Sprintf("DELETE FROM %s WHERE key NOT IN (%s)", tableName, querySb.String())
	stmt, err := d.db.Prepare(query)
	if err != nil {
		return err
	}

	// casting string to any
	keys := make([]any, cnt)
	for i := 0; i < cnt; i++ {
		keys[i] = values[i]
	}

	if _, err := stmt.Exec(keys...); err != nil {
		return err
	}

	return nil
}

func (d *DataStore) UpdateMetrics(collection *models.Collection) error {
	cntFields := 7
	sqlStmtHead := "REPLACE INTO container_metrics (key, pod_name, container_name, namespace, cpu_usage, memory_usage, creation_timestamp) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?, ?, ?)"
	rows := collection.Len()
	values := make([]any, rows*cntFields)
	i := 0
	for key, value := range collection.GetAll() {
		metric := value.(models.PodContainerMetric)

		creationTimestamp := metric.CreationTimestamp.Unix()

		values[i] = key
		values[i+1] = metric.PodName
		values[i+2] = metric.ContainerName
		values[i+3] = metric.Namespace
		values[i+4] = strconv.FormatInt(metric.CPUUsage, 10)
		values[i+5] = strconv.FormatInt(metric.MemoryUsage, 10)
		values[i+6] = strconv.FormatInt(creationTimestamp, 10)
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		return err
	}

	return d.removeOldMetrics()
}

func (d *DataStore) removeOldMetrics() error {
	dt := time.Now().Add(-time.Hour * 24 * 7).Unix()
	query := "DELETE FROM container_metrics WHERE creation_timestamp < ?"

	stmt, err := d.db.Prepare(query)
	if err != nil {
		return err
	}

	if _, err := stmt.Exec(dt); err != nil {
		return err
	}
	return nil
}

func (d *DataStore) GetAllMetrics() (*models.Collection, error) {
	collection := models.NewCollection()
	sqlStmt := "SELECT key, pod_name, container_name, namespace, cpu_usage, memory_usage, creation_timestamp FROM container_metrics"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		var key string
		var podName string
		var containerName string
		var namespace string
		var cpuUsage int64
		var memoryUsage int64
		var creationTimestamp int64

		if err := rows.Scan(&key, &podName, &containerName, &namespace, &cpuUsage, &memoryUsage, &creationTimestamp); err != nil {
			zap.L().Error("Could not scan result from sqllite database", zap.Error(err))
			return nil, err
		}

		collection.Set(key, models.PodContainerMetric{
			PodName:           podName,
			Namespace:         namespace,
			ContainerName:     containerName,
			CPUUsage:          cpuUsage,
			MemoryUsage:       memoryUsage,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}, false)
	}

	return collection, nil
}

func (d *DataStore) CloseConnections() {
	d.db.Close()
}
