import axios from "axios"
import { KDD_BASE_URL } from "../config";
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants";
import { CronjobWorkload, DaemonSetWorkload, DeploymentWorkload, JobWorkload, Namespace, PodWorkload, StatefulSetWorkload, Workload, Node, CombinedWorkloadInfo } from "./response_types";

export type Client = {
    getNamespaces: () => Promise<Array<Namespace>>;
    getWorkloads: () => Promise<Array<Workload>>;
    getWorkloadsByType: (type: string | undefined) => Promise<Array<Workload>>;
    getDeployments: () => Promise<Array<DeploymentWorkload>>;
    getDaemonsets: () => Promise<Array<DaemonSetWorkload>>;
    getStatefulsets: () => Promise<Array<StatefulSetWorkload>>;
    getPods: () => Promise<Array<PodWorkload>>;
    getCronjobs: () => Promise<Array<CronjobWorkload>>;
    getJobs: () => Promise<Array<JobWorkload>>;
    getNodes: () => Promise<Array<Node>>;
    getWorkloadByTypeAndNamespace: (type: string, namespace: string, name: string) => Promise<CombinedWorkloadInfo>
}

const client = (): Client => {
    axios.defaults.baseURL = KDD_BASE_URL
    const headers: Record<string, string> = { Accept: "application/json" }

    const getNamespaces = async (): Promise<Array<Namespace>> => {
        const { data } = await axios.get("/api/v1/namespaces", { headers })
        return data.data
    }

    const getWorkloads = async (): Promise<Array<Workload>> => {
        const { data } = await axios.get("/api/v1/workloads", { headers })
        return data.data
    }

    const getWorkloadsByType = async (type: string | undefined): Promise<Array<Workload>> => {
        switch (type) {
            case WORKLOAD_TYPE_DEPLOYMENTS:
                return getDeployments()
            case WORKLOAD_TYPE_DEAEMONSET:
                return getDaemonsets()
            case WORKLOAD_TYPE_STATEFULSETS:
                return getStatefulsets()
            case WORKLOAD_TYPE_CRONJOBS:
                return getCronjobs()
            case WORKLOAD_TYPE_JOBS:
                return getJobs()
            case WORKLOAD_TYPE_PODS:
                return getPods()
            default:
                return Promise.reject(new Error(`Passed workload type could not be found ${type}`))
        }
    }

    const getDeployments = async (): Promise<Array<DeploymentWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/deployments`, { headers })
        return data.data
    }

    const getDaemonsets = async (): Promise<Array<DaemonSetWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/daemonsets`, { headers })
        return data.data
    }

    const getStatefulsets = async (): Promise<Array<StatefulSetWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/statefulsets`, { headers })
        return data.data
    }

    const getPods = async (): Promise<Array<PodWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/pods`, { headers })
        return data.data
    }

    const getCronjobs = async (): Promise<Array<CronjobWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/cronjobs`, { headers })
        return data.data
    }

    const getJobs = async (): Promise<Array<JobWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/jobs`, { headers })
        return data.data
    }

    const getNodes = async (): Promise<Array<Node>> => {
        const { data } = await axios.get(`/api/v1/nodes`, { headers })
        return data.data
    }

    const getWorkloadByTypeAndNamespace = async (type: string, namespace: string, name: string): Promise<CombinedWorkloadInfo> => {
        let urlType = ""
        switch (type) {
            case WORKLOAD_TYPE_DEPLOYMENTS:
                urlType = "deployments"
                break
            case WORKLOAD_TYPE_DEAEMONSET:
                urlType = "daemonsets"
                break
            case WORKLOAD_TYPE_STATEFULSETS:
                urlType = "statefulsets"
                break
            case WORKLOAD_TYPE_CRONJOBS:
                urlType = "cronjobs"
                break
            case WORKLOAD_TYPE_JOBS:
                urlType = "jobs"
                break
            case WORKLOAD_TYPE_PODS:
                urlType = "pods"
                break
            default:
                return Promise.reject(new Error(`Passed workload type could not be found ${type}`))
        }
        const { data } = await axios.get(`/api/v1/workloads/${urlType}/${namespace}/${name}`, { headers })
        return data.data
    }



    const c: Client = {
        getNamespaces,
        getWorkloads,
        getDeployments,
        getDaemonsets,
        getStatefulsets,
        getPods,
        getCronjobs,
        getJobs,
        getNodes,
        getWorkloadsByType,
        getWorkloadByTypeAndNamespace,
    }

    return c
}

export default client