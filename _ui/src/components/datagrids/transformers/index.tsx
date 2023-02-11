import { Namespace, Workload } from "../../../clients/response_types"
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants"

type DataGridTransformer = {
    transformDataForNamespaceDataGrid: (namespaces: Array<Namespace>, workloads: Array<Workload>) => Array<NamespaceGridData>
}

type WorkloadCounts = {
    deployments: number,
    statefulsets: number,
    daemonsets: number
}

export type NamespaceGridData = Namespace & { workloads: WorkloadCounts }

export default function dataGridTransformers(): DataGridTransformer {
    return {
        transformDataForNamespaceDataGrid: (namespaces: Array<Namespace>, workloads: Array<Workload>): Array<NamespaceGridData> => {
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
    }
}