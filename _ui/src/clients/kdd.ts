import axios from "axios"
import { KDD_BASE_URL } from "../config";
import { Namespace, Workload } from "./response_types";

export type Client = {
    getNamespaces: () => Promise<Array<Namespace>>;
    getWorkloads: () => Promise<Array<Workload>>;
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

    const c: Client = {
        getNamespaces,
        getWorkloads
    }

    return c
}

export default client