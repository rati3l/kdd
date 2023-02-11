import axios from "axios"
import { KDD_BASE_URL } from "../config";
import { DaemonSetWorkload, DeploymentWorkload, Namespace, Workload } from "./response_types";

export type Client = {
    getNamespaces: () => Promise<Array<Namespace>>;
    getWorkloads: () => Promise<Array<Workload>>;
    getDeployments: () => Promise<Array<DeploymentWorkload>>;
    getDaemonsets: () => Promise<Array<DaemonSetWorkload>>;
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

    const getDeployments = async (): Promise<Array<DeploymentWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/deployments`, { headers })
        return data.data
    }

    const getDaemonsets = async (): Promise<Array<DaemonSetWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/daemonsets`, { headers })
        return data.data
    }

    const c: Client = {
        getNamespaces,
        getWorkloads,
        getDeployments,
        getDaemonsets,
    }

    return c
}

export default client