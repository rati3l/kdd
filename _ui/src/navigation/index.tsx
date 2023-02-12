import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants";

export type NavItemConfig = {
    to: string;
    name: string;
    end: boolean;
}

export type RefreshIntervalConfig = {
    ms: number;
    name: string;
}

export const getClusterNavigation = (): Array<NavItemConfig> => {
    const items: Array<NavItemConfig> = [
        {
            to: `/ui/`,
            name: `Nodes`,
            end: true,
        },
        {
            to: `/ui/namespaces`,
            name: `Namespaces`,
            end: false,
        }
    ]

    return items
}

export const getWorkloadNavigation = () => {
    const items: Array<NavItemConfig> = [
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_DEPLOYMENTS.toLocaleLowerCase()}`,
            name: `Deployments`,
            end: false,
        },
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_STATEFULSETS.toLocaleLowerCase()}`,
            name: `Statefulsets`,
            end: false,
        },
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_DEAEMONSET.toLocaleLowerCase()}`,
            name: `Daemonsets`,
            end: false,
        },
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_CRONJOBS.toLocaleLowerCase()}`,
            name: `Cronjobs`,
            end: false,
        },
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_JOBS.toLocaleLowerCase()}`,
            name: `Jobs`,
            end: false,
        },
        {
            to: `/ui/workloads/${WORKLOAD_TYPE_PODS.toLocaleLowerCase()}`,
            name: `Pods`,
            end: false,
        }
    ]

    return items
}

export const getRefreshIntervals = ():Array<RefreshIntervalConfig> => {
    const items : Array<RefreshIntervalConfig> = [
        {
            ms: 5000, 
            name: "5 sec."
        },
        {
            ms: 10000, 
            name: "10 sec."
        },
        {
            ms: 60000, 
            name: "1 min."
        },
        {
            ms: 60000 * 5, 
            name: "5 min."
        }
    ]

    return items
}