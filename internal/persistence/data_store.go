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
CREATE TABLE IF NOT EXISTS nodes (
	key TEXT NOT NULL PRIMARY KEY,
	name TEXT NOT NULL, 
	status TEXT NOT NULL, 
	roles TEXT NOT NULL,
	cpu INTEGER NOT NULL, 
	memory INTEGER NOT NULL, 
	os_image TEXT NOT NULL,
	kubelet_version TEXT NOT NULL, 
	labels TEXT NOT NULL, 
	annotations TEXT NOT NULL,
	creation_timestamp INTEGER NOT NULL
); 
CREATE TABLE IF NOT EXISTS namespaces (
	key TEXT NOT NULL PRIMARY KEY,
	status TEXT,
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
	restarts INT,
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
CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name);
CREATE INDEX IF NOT EXISTS idx_namespaces_name ON namespaces(name);
CREATE INDEX IF NOT EXISTS idx_workloads_namespacename ON workloads(namespace);
CREATE INDEX IF NOT EXISTS idx_container_metrics_pod_name ON container_metrics(pod_name);
CREATE INDEX IF NOT EXISTS idx_container_metrics_container_name ON container_metrics(container_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_container_metrics_unique_key_creation_timestamp ON container_metrics(key, creation_timestamp)
`

func filterWorkloadBySelector(selectorFilter map[string]string) models.FilterFunc {
	return func(a interface{}) bool {
		workload := a.(models.Workload)
		found := 0
		for selectorKey, selectorValue := range selectorFilter {
			for workloadKey, workloadValue := range workload.GetLabels() {
				if workloadKey == selectorKey && workloadValue == selectorValue {
					found++
					break
				}
			}
		}

		return len(selectorFilter) == found
	}
}

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

func (d *DataStore) ReplaceNodes(collection *models.Collection) error {
	cntFields := 11
	sqlStmtHead := "REPLACE INTO nodes (key, name, cpu, memory, os_image, kubelet_version, labels, annotations, creation_timestamp, status, roles) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	rows := collection.Len()
	values := make([]any, rows*cntFields)
	i := 0
	for key, value := range collection.GetAll() {
		node := value.(models.Node)
		labels, err := json.Marshal(node.Labels)
		if err != nil {
			return err
		}
		annotations, err := json.Marshal(node.Annotations)
		if err != nil {
			return err
		}
		creationTimestamp := node.CreationTimestamp.Unix()

		values[i] = key
		values[i+1] = node.Name
		values[i+2] = node.Cpu
		values[i+3] = node.Memory
		values[i+4] = node.OsImage
		values[i+5] = node.KubeletVersion
		values[i+6] = string(labels)
		values[i+7] = string(annotations)
		values[i+8] = strconv.FormatInt(creationTimestamp, 10)
		values[i+9] = node.Status
		values[i+10] = node.Roles
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		zap.L().Error("could not replace nodes", zap.Error(err))
		return err
	}

	return d.cleanUpAfterReplace("nodes", collection.GetKeys())
}

func (d *DataStore) GetAllNodes() (*models.Collection, error) {
	collection := models.NewCollection()
	sqlStmt := "SELECT key, name, cpu, memory, os_image, kubelet_version, labels, annotations, creation_timestamp, roles, status FROM nodes"
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
		var roles string
		var status string
		var cpu int64
		var memory int64
		var os_image string
		var kubelet_version string
		var creationTimestamp int64
		var rawLabels []byte
		var rawAnnotations []byte
		labels := make(map[string]string)
		annotations := make(map[string]string)

		if err := rows.Scan(&key, &name, &cpu, &memory, &os_image, &kubelet_version, &rawLabels, &rawAnnotations, &creationTimestamp, &roles, &status); err != nil {
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

		ns := models.Node{
			Name:              name,
			Roles:             roles,
			Status:            status,
			Cpu:               cpu,
			Memory:            memory,
			OsImage:           os_image,
			KubeletVersion:    kubelet_version,
			Labels:            labels,
			Annotations:       annotations,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}

		collection.Set(key, ns, false)
	}

	return collection, nil

}

func (d *DataStore) ReplaceNamespaces(collection *models.Collection) error {
	cntFields := 6
	sqlStmtHead := "REPLACE INTO namespaces (key, name, status, labels, annotations, creation_timestamp) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?, ?)"
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
		values[i+2] = namespace.Status
		values[i+3] = string(labels)
		values[i+4] = string(annotations)
		values[i+5] = strconv.FormatInt(creationTimestamp, 10)
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		zap.L().Error("could not replace namespaces", zap.Error(err))
		return err
	}

	return d.cleanUpAfterReplace("namespaces", collection.GetKeys())
}

func (d *DataStore) GetAllNamespaces() (*models.Collection, error) {
	collection := models.NewCollection()
	sqlStmt := "SELECT key, name, status, labels, annotations, creation_timestamp FROM namespaces"
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
		var status string
		var creationTimestamp int64
		var rawLabels []byte
		var rawAnnotations []byte
		labels := make(map[string]string)
		annotations := make(map[string]string)

		if err := rows.Scan(&key, &name, &status, &rawLabels, &rawAnnotations, &creationTimestamp); err != nil {
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
			Status:            status,
			Labels:            labels,
			Annotations:       annotations,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}

		collection.Set(key, ns, false)
	}

	return collection, nil

}

func (d *DataStore) GetNamespace(name string) (*models.Namespace, error) {
	sqlStmt := "SELECT key, name, status, labels, annotations, creation_timestamp FROM namespaces WHERE name=? LIMIT 1"
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
		var status string
		var creationTimestamp int64
		var rawLabels []byte
		var rawAnnotations []byte
		labels := make(map[string]string)
		annotations := make(map[string]string)

		if err := rows.Scan(&key, &name, &status, &rawLabels, &rawAnnotations, &creationTimestamp); err != nil {
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
			Status:            status,
			Labels:            labels,
			Annotations:       annotations,
			CreationTimestamp: time.Unix(creationTimestamp, 0),
		}, nil
	}

	return nil, fmt.Errorf(fmt.Sprintf("namespace %s could not be found", name))

}

func (d *DataStore) ReplaceWorkloads(collection *models.Collection) error {
	cntFields := 11
	sqlStmtHead := "REPLACE INTO workloads (key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp) VALUES "
	sqlStmtVals := "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
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

		if value, ok := workload.(models.PodWorkload); ok {
			values[i+9] = value.Restarts
		} else {
			values[i+9] = "0"
		}
		values[i+10] = strconv.FormatInt(creationTimestamp, 10)
		i += cntFields
	}

	if err := d.replace(sqlStmtHead, sqlStmtVals, rows, values); err != nil {
		zap.L().Error("could not replace workloads", zap.Error(err))
		return err
	}

	return d.cleanUpAfterReplace("workloads", collection.GetKeys())
}

func (d *DataStore) GetAllWorkloads() (*models.Collection, error) {
	sqlStmt := "SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp FROM workloads"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	return d.createWorkloadCollection(rows)
}

func (d *DataStore) GetAllByWorkloadType(t string) (*models.Collection, error) {
	sqlStmt := "SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp FROM workloads WHERE workload_type=?"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query(t)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	return d.createWorkloadCollection(rows)
}

func (*DataStore) createWorkloadCollection(rows *sql.Rows) (*models.Collection, error) {
	collection := models.NewCollection()
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
		var restarts int
		containers := make([]models.Container, 0)
		labels := make(map[string]string)
		annotations := make(map[string]string)
		selector := make(map[string]string)

		if err := rows.Scan(&key, &workloadName, &workloadType, &namespace, &rawLabels, &rawAnnotations, &rawSelector, &rawContainers, &rawStatus, &restarts, &creationTimestamp); err != nil {
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
				Restarts:            restarts,
			}
			collection.Set(key, wl, false)
		default:
			zap.L().Error(fmt.Sprintf("unsupported type: %s", workloadType))
		}
	}

	return collection, nil
}

func (d *DataStore) GetWorkloadsByNamespace(namespace string) (*models.Collection, error) {
	sqlStmt := "SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp FROM workloads WHERE namespace=?"
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query(namespace)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	return d.createWorkloadCollection(rows)
}

func (d *DataStore) GetMetricsForPodsInNamespace(namespace string, workloads []models.Workload) (*models.Collection, error) {
	podNames := make([]any, len(workloads))
	for i, workload := range workloads {
		podNames[i] = workload.GetWorkloadName()
		if workload.GetType() != models.WORKLOAD_TYPE_POD {
			return nil, fmt.Errorf("the workload needs to be a pod. workload_type: %s", workload.GetType())
		}
	}

	if len(podNames) == 0 {
		return nil, fmt.Errorf("no pods given")
	}

	sqlStmt := "SELECT key, pod_name, container_name, namespace, cpu_usage, memory_usage, creation_timestamp FROM container_metrics WHERE namespace=? AND pod_name IN "

	var sb strings.Builder
	sb.WriteString(sqlStmt)

	sb.WriteRune('(')
	for i := 0; i < len(podNames); i++ {
		sb.WriteRune('?')
		if i != len(podNames)-1 {
			sb.WriteString(", ")
		} else {
			sb.WriteRune(')')
		}
	}

	stmt, err := d.db.Prepare(sb.String())
	if err != nil {
		return nil, err
	}

	whereValues := make([]any, 0)
	whereValues = append(whereValues, namespace)
	whereValues = append(whereValues, podNames...)

	rows, err := stmt.Query(whereValues...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	resultCollection := models.NewCollection()

	for rows.Next() {
		var key string
		var podName string
		var containerName string
		var namespace string
		var cpuUsage int64
		var memoryUsage int64
		var creationTimestamp int

		if err := rows.Scan(&key, &podName, &containerName, &namespace, &cpuUsage, &memoryUsage, &creationTimestamp); err != nil {
			zap.L().Error("Could not scan result from sqlite database", zap.Error(err))
			return nil, err
		}

		resultCollection.Set(fmt.Sprintf("%s_%s_%d", podName, namespace, creationTimestamp), models.PodContainerMetric{
			PodName:           podName,
			Namespace:         namespace,
			ContainerName:     containerName,
			CPUUsage:          cpuUsage,
			MemoryUsage:       memoryUsage,
			CreationTimestamp: time.Unix(int64(creationTimestamp), 0),
		}, true)
	}

	return resultCollection, nil
}

func (d *DataStore) GetWorkloadBy(filters map[string]string) (models.Workload, error) {
	sqlParams := make([]string, len(filters))
	values := make([]any, len(filters))
	i := 0
	for key, val := range filters {
		if key != "namespace" && key != "workload_name" && key != "workload_type" {
			return nil, fmt.Errorf("invalid parameters found")
		}

		sqlParams[i] = fmt.Sprintf("%s = ?", key)
		values[i] = val
		i++
	}

	sqlStmt := fmt.Sprintf("SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp FROM workloads WHERE %s LIMIT 1", strings.Join(sqlParams, " AND "))
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query(values...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	collectionResult, err := d.createWorkloadCollection(rows)
	if err != nil {
		return nil, err
	}

	if collectionResult.Len() < 1 {
		return nil, fmt.Errorf("no result found")
	}

	return collectionResult.ToList()[0].(models.Workload), nil
}

func (d *DataStore) GetWorkloadsBy(filters map[string]string) (*models.Collection, error) {
	sqlParams := make([]string, len(filters))
	values := make([]any, len(filters))
	i := 0
	for key, val := range filters {
		if key != "namespace" && key != "workload_name" && key != "workload_type" {
			return nil, fmt.Errorf("invalid parameters found")
		}

		sqlParams[i] = fmt.Sprintf("%s = ?", key)
		values[i] = val
		i++
	}

	sqlStmt := fmt.Sprintf("SELECT key, workload_name, workload_type, namespace, labels, annotations, selector, containers, status, restarts, creation_timestamp FROM workloads WHERE %s", strings.Join(sqlParams, " AND "))
	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		return nil, err
	}

	rows, err := stmt.Query(values...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return d.createWorkloadCollection(rows)
}

func (d *DataStore) GetPodsForWorkload(w models.Workload) (*models.Collection, error) {
	filter := make(map[string]string)
	filter["namespace"] = w.GetNamespace()
	filter["workload_type"] = models.WORKLOAD_TYPE_POD
	collection, err := d.GetWorkloadsBy(filter)
	if err != nil {
		return nil, err
	}
	return collection.Filter(filterWorkloadBySelector(w.GetSelector())), nil
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
		zap.L().Error("could not replace metrics", zap.Error(err))
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
