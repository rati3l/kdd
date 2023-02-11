import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import client from "../clients/kdd";
import { Workload } from "../clients/response_types";
import { useParams } from "react-router-dom";
import { urlWorkloadTypeToConstant } from "../utils";
import WorkloadDataGrid from "../components/datagrids/WorkloadDataGrid";
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants";

type Props = {
    refreshIntervalMS: number;
}

function Workloads(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [workloads, setWorkloads] = useState<Array<Workload>>([])

    const workloadType = useParams<string>()["workloadType"]

    const checkError = (error: any) => {
        if (axios.isAxiosError(error)) {
            console.error("failed to retrieve information", error.message)
            setErrorMessage("failed to retrieve information")
        } else {
            console.error("a unknown error occurred", error)
            setErrorMessage("a unknown error occurred")
        }
    }

    const finishLoading = () => {
        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)
        const load = () => {
            client().getWorkloadsByType(urlWorkloadTypeToConstant(workloadType)).then((workloads: Array<Workload>) => {
                setWorkloads(workloads)
            })
                .catch(checkError)
                .finally(finishLoading)
        }

        // fetching data initially
        load()
        const interval: any = setInterval(() => {
            load()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS, workloadType]);

    const getPageHeadTitle = (param: string | undefined): string => {
        switch (param?.toLowerCase()) {
            case WORKLOAD_TYPE_DEPLOYMENTS:
                return "Workloads - Deployments"
            case WORKLOAD_TYPE_DEAEMONSET:
                return "Workloads - Daemonsets"
            case WORKLOAD_TYPE_STATEFULSETS:
                return "Workloads - Statefulsets"
            case WORKLOAD_TYPE_CRONJOBS:
                return "Workloads - Cronjobs"
            case WORKLOAD_TYPE_JOBS:
                return "Workloads - Jobs"
            case WORKLOAD_TYPE_PODS:
                return "Workloads - Pods"

            default:
                return ""
        }
    }

    return <React.Fragment>
        <PageHead title={getPageHeadTitle(urlWorkloadTypeToConstant(workloadType))} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <WorkloadDataGrid workloadType={urlWorkloadTypeToConstant(workloadType)} workloads={workloads.filter(f => f.type === urlWorkloadTypeToConstant(workloadType))} height="800px" />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Workloads