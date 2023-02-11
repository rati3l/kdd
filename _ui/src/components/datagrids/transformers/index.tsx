import { DaemonSetWorkload, DeploymentWorkload, Namespace, PodWorkload, StatefulSetWorkload, Workload } from "../../../clients/response_types"
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants"

type DataGridTransformer = {
    transformDataForNamespaceDataGrid: (namespaces: Array<Namespace>, workloads: Array<Workload>) => Array<NamespaceGridData>
    transformDataForDeploymentDataGrid: (deployments: Array<DeploymentWorkload>) => Array<DeploymentDataGrid>
    transformDataForDaemonsetDataGrid: (daemonsets: Array<DaemonSetWorkload>) => Array<DaemonsetDataGrid>
    transformDataForStatefulsetDataGrid: (statefulsets: Array<StatefulSetWorkload>) => Array<StatefulsetDataGrid>
    transformDataForPodDataGrid: (pods: Array<PodWorkload>) => Array<PodDataGrid>
}

type WorkloadCounts = {
    deployments: number,
    statefulsets: number,
    daemonsets: number
}

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
                labels: row.workload_info.labels,
                selector: row.workload_info.selector,
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
                labels: row.workload_info.labels,
                selector: row.workload_info.selector,
                restarts: row.restarts,
                status: row.status,
            }
            return data
        })
    }

    return {
        transformDataForNamespaceDataGrid,
        transformDataForDeploymentDataGrid,
        transformDataForDaemonsetDataGrid,
        transformDataForStatefulsetDataGrid,
        transformDataForPodDataGrid,
    }
}