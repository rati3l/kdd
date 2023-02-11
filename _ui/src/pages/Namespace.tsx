import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import { Box } from "@mui/system";
import { Alert, Chip, CircularProgress, Grid, Snackbar, Tab, Tabs } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import FailedCountCard from "../components/infocards/FailedCountCard";
import SectionHead from "../components/commons/SectionHead";
import EventDataGrid from "../components/datagrids/EventDataGrid";
import { Event } from "../clients/response_types";
import WorkloadDataGrid from "../components/datagrids/WorkloadDataGrid";
import { WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_STATEFULSETS } from "../constants";

type Props = {
    refreshIntervalMS: number;
}

export interface IStringHashMap {
    [key: string]: string;
}

export interface INamespace {
    status: string;
    name: string;
    labels: IStringHashMap;
    annotations: IStringHashMap;
    creation_date: string
}


export interface IWorkloadCount {
    total: number;
    failed: number;
}

export interface IWorkloadCounts {
    [type: string]: IWorkloadCount;
}

export interface IWorkloads {
    [type: string]: any[];
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function Namespace(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [namespaceData, setNamespaceData] = useState<INamespace>({ name: "", status: "", labels: {}, annotations: {}, creation_date: "" })
    const [workloadCounts, setWorkloadsCount] = useState<IWorkloadCounts>({
        "Deployment": { total: 0, failed: 0 },
        "Daemonset": { total: 0, failed: 0 },
        "Statefulset": { total: 0, failed: 0 },
    })
    const [events, setEvents] = useState<Array<Event>>([])
    const [workloads, setWorkloads] = useState<IWorkloads>({
        "Deployments": [],
        "Daemonset": [],
        "Statefulset": []
    })

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const paramName = useParams()["name"]

    useEffect(() => {
        setLoading(true)

        const fetchFunc = (name: string | undefined) => {
            const getNamespace = async () => {
                const { data } = await axios.get(`/api/v1/namespaces/${name}`, { headers: { Accept: "application/json" } })
                return data.data
            }

            getNamespace().then(data => {
                setNamespaceData(data.namespace)
                setEvents(data.events)
                const newWorkloadCountsState: IWorkloadCounts = {
                    "Deployment": { total: 0, failed: 0 },
                    "Daemonset": { total: 0, failed: 0 },
                    "Statefulset": { total: 0, failed: 0 },
                }
                const newWorkloads: IWorkloads = {
                    "Deployment": [],
                    "Daemonset": [],
                    "Statefulset": [],
                }
                Object.keys(newWorkloadCountsState).forEach((type: string) => {
                    data.workloads.forEach((workload: any) => {
                        if (workload.type === type) {
                            newWorkloadCountsState[type].total++
                            switch (type) {
                                case "Deployment":
                                case "Daemonset":
                                    if (workload.status.desired !== workload.status.ready) {
                                        newWorkloadCountsState[type].failed++
                                    }
                                    break;
                                case "Statefulset":
                                    if (workload.status.replicas !== workload.status.ready) {
                                        newWorkloadCountsState[type].failed++
                                    }
                                    break;
                            }
                            newWorkloads[type].push(workload)
                        }
                    })
                })
                setWorkloadsCount(newWorkloadCountsState)
                setWorkloads(newWorkloads)
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve namespace information", error.message)
                    setErrorMessage("failed to retrieve namespace information")
                } else {
                    console.error("a unknown error occurred", error)
                    setErrorMessage("a unknown error occurred")
                }
            }).finally(() => {
                setLoading(false)
            })
        }
        setLoading(true)
        // fetching data initially
        fetchFunc(paramName)

        const interval: any = setInterval(() => {
            fetchFunc(paramName)
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS, paramName]);



    return <React.Fragment>
        <PageHead title={`Namespace ${paramName}`} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <div>
                <Box mb={1}>
                    <b>Status: </b> <Chip variant="outlined" label={namespaceData.status} size="small" color="success" />
                </Box>
                <Box mb={1}>
                    <b>Labels: </b> {Object.keys(namespaceData.labels || {}).map((key) => {
                        return <Chip variant="filled" label={`${key}=${namespaceData.labels[key]}`} size="small" key={key} color="primary" sx={{ mr: 1 }} />
                    })}
                </Box>
                <Box mb={1}>
                    <b>Annotations: </b>{Object.keys(namespaceData.annotations || {}).filter((k) => k !== "cattle.io/status" && k !== 'kubectl.kubernetes.io/last-applied-configuration').map((key) => {
                        return <Chip variant="filled" label={`${key}=${namespaceData.annotations[key]}`} size="small" key={key} color="secondary" sx={{ mr: 1 }} />
                    })}
                </Box>
                <Box mb={1}>
                    <b>Creation Timestamp: </b> {moment(namespaceData.creation_date).format("YYYY-MM-DD HH:mm")} <Chip variant="outlined" color="secondary" label={moment(namespaceData.creation_date).fromNow()} size="small"></Chip>
                </Box>
                <Grid container={true} spacing={2} mt={2} mb={2}>
                    <Grid item sm={4}>
                        <FailedCountCard headline="Deployments (failed)" total={workloadCounts["Deployment"].total} failed={workloadCounts["Deployment"].failed} />
                    </Grid>
                    <Grid item sm={4}>
                        <FailedCountCard headline="DaemonSets (failed)" total={workloadCounts["Daemonset"].total} failed={workloadCounts["Daemonset"].failed} />
                    </Grid>
                    <Grid item sm={4}>
                        <FailedCountCard headline="StatefulSets (failed)" total={workloadCounts["Statefulset"].total} failed={workloadCounts["Statefulset"].failed} />
                    </Grid>
                </Grid>
                <SectionHead title="Events" />
                <EventDataGrid events={events} />
                <SectionHead title="Workloads" />
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Deployments" {...a11yProps(0)} />
                        <Tab label="Daemonsets" {...a11yProps(1)} />
                        <Tab label="Statefulsets" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <WorkloadDataGrid workloadType={WORKLOAD_TYPE_DEPLOYMENTS} workloads={workloads["Deployment"]} height="600px" />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <WorkloadDataGrid workloadType={WORKLOAD_TYPE_DEAEMONSET} workloads={workloads["Daemonset"]} height="600px" />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <WorkloadDataGrid workloadType={WORKLOAD_TYPE_STATEFULSETS} workloads={workloads["Statefulset"]} height="600px" />
                </TabPanel>
            </div>}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespace