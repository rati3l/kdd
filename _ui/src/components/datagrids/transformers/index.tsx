import moment from "moment"
import { CronjobWorkload, DaemonSetWorkload, DeploymentWorkload, JobStatus, JobWorkload, Namespace, Node, PodWorkload, StatefulSetWorkload, Workload } from "../../../clients/response_types"
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants"

type DataGridTransformer = {
    transformDataForNamespaceDataGrid: (namespaces: Array<Namespace>, workloads: Array<Workload>) => Array<NamespaceGridData>
    transformDataForDeploymentDataGrid: (deployments: Array<DeploymentWorkload>) => Array<DeploymentDataGrid>
    transformDataForDaemonsetDataGrid: (daemonsets: Array<DaemonSetWorkload>) => Array<DaemonsetDataGrid>
    transformDataForStatefulsetDataGrid: (statefulsets: Array<StatefulSetWorkload>) => Array<StatefulsetDataGrid>
    transformDataForPodDataGrid: (pods: Array<PodWorkload>) => Array<PodDataGrid>
    transformDataForCronjobDataGrid: (jobs: Array<CronjobWorkload>) => Array<CronjobDataGrid>
    transformDataForJobDataGrid: (jobs: Array<JobWorkload>) => Array<JobDataGrid>
    transformDataForNodeDataGrid: (nodes: Array<Node>) => Array<NodeDataGrid>
}

type WorkloadCounts = {
    deployments: number,
    statefulsets: number,
    daemonsets: number
}

export type NodeDataGrid = Node
export type NamespaceGridData = Namespace & { workloads: WorkloadCounts }
export type DeploymentDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    status: string,
    status_ready: string,
    status_available: number,
    status_up2date: number
}

export type DaemonsetDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    status: string,
    status_ready: string,
    status_available: number,
    status_up2date: number
}

export type StatefulsetDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    status: string,
    status_ready: string,
}

export type PodDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    count_containers: number,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    restarts: number,
    status: string,
}

export type CronjobDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    active_jobs: number,
    last_scheduled_time: string,
    last_successful_time: string,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    suspend: boolean,
    schedule: string,
}

export type JobDataGrid = {
    workload_name: string,
    namespace: string,
    creation_date: string,
    start_time: string,
    completion_time: string,
    annotations: Record<string, string>,
    labels: Record<string, string>,
    selector: Record<string, string>,
    status: string,
    status_active: number,
    status_failed: number,
    status_succeeded: number,
    duration: moment.Duration | null,
}

export default function dataGridTransformers(): DataGridTransformer {

    const transformDataForNamespaceDataGrid = (namespaces: Array<Namespace>, workloads: Array<Workload>): Array<NamespaceGridData> => {
        return namespaces.map((ns: Namespace): NamespaceGridData => {
            const data: NamespaceGridData = {
                ...ns,
                workloads: { statefulsets: 0, deployments: 0, daemonsets: 0 }
            }

            workloads.filter((w: any) => w.workload_info.namespace === ns.name).forEach((w: any) => {
                switch (w.type) {
                    case WORKLOAD_TYPE_DEAEMONSET:
                        data.workloads.daemonsets++
                        break;
                    case WORKLOAD_TYPE_DEPLOYMENTS:
                        data.workloads.deployments++
                        break;
                    case WORKLOAD_TYPE_STATEFULSETS:
                        data.workloads.statefulsets++
                        break
                    case WORKLOAD_TYPE_JOBS:
                    case WORKLOAD_TYPE_CRONJOBS:
                    case WORKLOAD_TYPE_PODS:
                        // nothing to do here
                        break
                    default:
                        console.error("unknown workload type found", w.type)
                }
            })

            return data
        })
    }

    const transformDataForDeploymentDataGrid = (deployments: Array<DeploymentWorkload>): Array<DeploymentDataGrid> => {
        return deployments.map((row: DeploymentWorkload) => {
            const data: DeploymentDataGrid = {
                workload_name: row.workload_info.workload_name,
                namespace: row.workload_info.namespace,
                creation_date: row.workload_info.creation_date,
                annotations: row.workload_info.annotations || {},
                labels: row.workload_info.labels || {},
                selector: row.workload_info.selector || {},
                status: (row.status.ready !== row.status.desired) ? "loading" : "running",
                status_ready: `${row.status.ready}/${row.status.desired}`,
                status_available: row.status.available,
                status_up2date: row.status.up2date
            }

            return data
        })
    }

    const transformDataForDaemonsetDataGrid = (daemonsets: Array<DaemonSetWorkload>): Array<DaemonsetDataGrid> => {
        return daemonsets.map((row: DaemonSetWorkload) => {
            const data: DaemonsetDataGrid = {
                workload_name: row.workload_info.workload_name,
                namespace: row.workload_info.namespace,
                creation_date: row.workload_info.creation_date,
                annotations: row.workload_info.annotations || {},
                labels: row.workload_info.labels || {},
                selector: row.workload_info.selector || {},
                status: (row.status.ready !== row.status.desired) ? "loading" : "running",
                status_ready: `${row.status.ready}/${row.status.desired}`,
                status_available: row.status.available,
                status_up2date: row.status.up2date
            }

            return data
        })
    }

    const transformDataForStatefulsetDataGrid = (statefulsets: Array<StatefulSetWorkload>): Array<StatefulsetDataGrid> => {
        return statefulsets.map((row: StatefulSetWorkload) => {
            const data: StatefulsetDataGrid = {
                workload_name: row.workload_info.workload_name,
                namespace: row.workload_info.namespace,
                creation_date: row.workload_info.creation_date,
                annotations: row.workload_info.annotations || {},
                labels: row.workload_info.labels || {},
                selector: row.workload_info.selector || {},
                status: (row.status.ready !== row.status.replicas) ? "loading" : "running",
                status_ready: `${row.status.ready}/${row.status.replicas}`,
            }

            return data
        })
    }

    const transformDataForPodDataGrid = (pods: Array<PodWorkload>): Array<PodDataGrid> => {
        return pods.map((row: PodWorkload) => {
            const data: PodDataGrid = {
                workload_name: row.workload_info.workload_name,
                namespace: row.workload_info.namespace,
                creation_date: row.workload_info.creation_date,
                count_containers: row.workload_info.containers.length,
                annotations: row.workload_info.annotations || {},
                labels: row.workload_info.labels || {},
                selector: row.workload_info.selector || {},
                restarts: row.restarts,
                status: row.status,
            }
            return data
        })
    }

    const transformDataForCronjobDataGrid = (jobs: Array<CronjobWorkload>): Array<CronjobDataGrid> => {
        return jobs.map((row: CronjobWorkload) => {
            const data: CronjobDataGrid = {
                workload_name: row.workload_info.workload_name,
                namespace: row.workload_info.namespace,
                creation_date: row.workload_info.creation_date,
                active_jobs: row.status.active_jobs.length,
                last_scheduled_time: row.status.last_scheduled_time,
                last_successful_time: row.status.last_successful_time,
                annotations: row.workload_info.annotations || {},
                labels: row.workload_info.labels || {},
                selector: row.workload_info.selector || {},
                suspend: row.suspend,
                schedule: row.schedule
            }
            return data
        })
    }

    const transformDataForJobDataGrid = (jobs: Array<JobWorkload>): Array<JobDataGrid> => {
        const statusAsString = (status: JobStatus) => {
            if (status.active > 0) {
                return "running"
            }

            if (status.failed > 0) {
                return "failed"
            }

            if (status.succeeded > 0) {
                return "succeeded"
            }

            return "unknown"
        }

        const calculateDuration = (status: JobStatus): moment.Duration | null => {
            if (status.completion_time) {
                return moment.duration(moment(status.completion_time).diff(moment(status.start_time)));
            }
            return null
        }

        return jobs.map((job: JobWorkload): JobDataGrid => {
            return {
                workload_name: job.workload_info.workload_name,
                namespace: job.workload_info.namespace,
                creation_date: job.workload_info.creation_date,
                start_time: job.status.start_time,
                completion_time: job.status.completion_time,
                annotations: job.workload_info.annotations || {},
                labels: job.workload_info.labels || {},
                selector: job.workload_info.selector || {},
                status: statusAsString(job.status),
                status_active: job.status.active,
                status_failed: job.status.failed,
                status_succeeded: job.status.succeeded,
                duration: calculateDuration(job.status)
            }
        })
    }

    const transformDataForNodeDataGrid = (nodes: Array<Node>): Array<NodeDataGrid> => {
        return nodes
    }

    return {
        transformDataForNamespaceDataGrid,
        transformDataForDeploymentDataGrid,
        transformDataForDaemonsetDataGrid,
        transformDataForStatefulsetDataGrid,
        transformDataForPodDataGrid,
        transformDataForCronjobDataGrid,
        transformDataForJobDataGrid,
        transformDataForNodeDataGrid,
    }
}