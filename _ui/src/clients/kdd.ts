import axios from "axios"
import { KDD_BASE_URL } from "../config";
import { DeploymentWorkload, Namespace, Workload } from "./response_types";

export type Client = {
    getNamespaces: () => Promise<Array<Namespace>>;
    getWorkloads: () => Promise<Array<Workload>>;
    getDeployments: () => Promise<Array<DeploymentWorkload>>;
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

    const getDeployments = async ():Promise<Array<DeploymentWorkload>> => {
        const { data } = await axios.get(`/api/v1/workloads/deployments`, { headers })
        return data.data
    }

    const c: Client = {
        getNamespaces,
        getWorkloads, 
        getDeployments,
    }

    return c
}

export default client