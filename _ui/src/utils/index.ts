import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants"

export const buildWorkloadLink = (type: string, namespace: string, name: string): string => {
    if (isWorkloadType(type)) {
        return `/ui/workloads/${type.toLocaleLowerCase()}/${namespace}/${name}`
    }

    return ""
}

export const urlWorkloadTypeToConstant = (param: string | undefined): string => {
    switch (param?.toLowerCase()) {
        case WORKLOAD_TYPE_DEPLOYMENTS.toLowerCase():
            return WORKLOAD_TYPE_DEPLOYMENTS
        case WORKLOAD_TYPE_DEAEMONSET.toLowerCase():
            return WORKLOAD_TYPE_DEAEMONSET
        case WORKLOAD_TYPE_STATEFULSETS.toLowerCase():
            return WORKLOAD_TYPE_STATEFULSETS
        case WORKLOAD_TYPE_CRONJOBS.toLowerCase():
            return WORKLOAD_TYPE_CRONJOBS
        case WORKLOAD_TYPE_JOBS.toLowerCase():
            return WORKLOAD_TYPE_JOBS
        case WORKLOAD_TYPE_PODS.toLowerCase():
            return WORKLOAD_TYPE_PODS

        default:
            return ""
    }
}

export const isWorkloadType = (type: string | undefined): boolean => {
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