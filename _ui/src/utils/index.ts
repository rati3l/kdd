import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants"

export const buildWorkloadLink = (type: string, namespace: string, name: string): string => {
    switch (type) {
        case WORKLOAD_TYPE_DEPLOYMENTS:
            return `/ui/workloads/deployments/${namespace}/${name}`
        case WORKLOAD_TYPE_DEAEMONSET:
            return `/ui/workloads/daemonsets/${namespace}/${name}`
        case WORKLOAD_TYPE_STATEFULSETS:
            return `/ui/workloads/statefulsets/${namespace}/${name}`
        case WORKLOAD_TYPE_CRONJOBS:
            return `/ui/workloads/cronjobs/${namespace}/${name}`
        case WORKLOAD_TYPE_JOBS:
            return `/ui/workloads/jobs/${namespace}/${name}`
        case WORKLOAD_TYPE_PODS:
            return `/ui/workloads/pods/${namespace}/${name}`
        default:
            return ""
    }
}

export const isWorkloadType = (type: string): boolean => {
    switch (type) {
        case WORKLOAD_TYPE_DEPLOYMENTS:
        case WORKLOAD_TYPE_DEAEMONSET:
        case WORKLOAD_TYPE_STATEFULSETS:
        case WORKLOAD_TYPE_CRONJOBS:
        case WORKLOAD_TYPE_JOBS:
        case WORKLOAD_TYPE_PODS:
            return true
        default:
            return false
    }
}