import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import SectionHead from "../components/commons/SectionHead";
import WorkloadInfoBox from "../components/infobox/WorkloadInfoBox";
import PodInfoTable from "../components/tables/PodInfoTable";
import client from "../clients/kdd";
import { Box } from "@mui/system";
import { Alert, Card, CardContent, CircularProgress, Grid, Snackbar } from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../constants";
import { isWorkloadType, urlWorkloadTypeToConstant } from "../utils";
import PodsMemChart from "../components/charts/PodsMemChart";
import PodsCPUChart from "../components/charts/PodsCPUChart";

type Props = {
    refreshIntervalMS: number;
}

const getHeadlineByWorkloadType = (workloadType: string | undefined) => {
    switch (workloadType?.toLowerCase()) {
        case WORKLOAD_TYPE_DEPLOYMENTS.toLowerCase():
            return "Deployment"
        case WORKLOAD_TYPE_DEAEMONSET.toLowerCase():
            return "Daemonset"
        case WORKLOAD_TYPE_STATEFULSETS.toLowerCase():
            return "Statefulset"
        case WORKLOAD_TYPE_CRONJOBS.toLowerCase():
            return "Cronjob"
        case WORKLOAD_TYPE_JOBS.toLowerCase():
            return "Job"
        case WORKLOAD_TYPE_PODS.toLowerCase():
            return "Pod"
        default:
            return ""
    }
}

function Workload(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [workload, setWorkload] = useState<any>({})
    const [pods, setPods] = useState<any[]>([])
    const [metrics, setMetrics] = useState<any[]>([])

    const namespace = useParams<string>()["namespace"]
    const name = useParams<string>()["name"]
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
        const load = (namespace: string | undefined, name: string | undefined) => {
            if (namespace && name) {
                client().getWorkloadByTypeAndNamespace(urlWorkloadTypeToConstant(workloadType), namespace, name).then(data => {
                    setWorkload(data.workload)
                    setPods(data.pods)
                    setMetrics(data.metrics)
                })
                    .catch(checkError)
                    .finally(finishLoading)
            }
        }

        if (isWorkloadType(urlWorkloadTypeToConstant(workloadType))) {
            setLoading(true)
            // fetching data initially
            load(namespace, name)
            const interval: any = setInterval(() => {
                load(namespace, name)
            }, props.refreshIntervalMS)

            return () => {
                clearInterval(interval)
            }
        }

    }, [props.refreshIntervalMS, namespace, name, workloadType]);


    if (!isWorkloadType(urlWorkloadTypeToConstant(workloadType))) {
        return <Navigate to="/ui/" />
    }

    return <React.Fragment>
        <PageHead title={`${getHeadlineByWorkloadType(workloadType)} ${name}`} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <WorkloadInfoBox workload={workload} />}
        </Box>
        <SectionHead title="Metrics" />
        <Box>
            <Grid container spacing={1}>
                <Grid item sm={6}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <PodsMemChart metrics={metrics} pods={pods} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sm={6}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <PodsCPUChart metrics={metrics} pods={pods} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
        <PodInfoTable title="Pods &amp; Containers" metrics={metrics} pods={pods}></PodInfoTable>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Workload