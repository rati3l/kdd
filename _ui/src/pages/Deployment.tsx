import React, { useEffect, useState } from "react"
import PageHead from "../components/PageHead"
import { Box } from "@mui/system";
import { Alert, Card, CardContent, Chip, CircularProgress, Collapse, Grid, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useParams } from "react-router-dom";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import axios from "axios";
import filesize from "file-size";
import moment from "moment";
import SectionHead from "../components/SectionHead";
import MemChart, { LimitMemory, RequestMemory } from "../components/MemChart";
import CpuChart, { LimitCPU, RequestCPU } from "../components/CpuChart";

type Props = {
    refreshIntervalMS: number;
}

function Row(props: { row: any }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    const renderStatusChip = (status: string) => {
        return <Chip variant="outlined" label={status} size="small" color={(status === "Running" ? "success" : "error")} sx={{ mr: 1 }} />
    }

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.workload_info.workload_name}</TableCell>
                <TableCell>{renderStatusChip(row.status)}</TableCell>
                <TableCell>{row.workload_info.containers.length}</TableCell>
                <TableCell>{Object.keys(row.workload_info.labels).map((key) => {
                    return <Chip variant="filled" label={`${key}=${row.workload_info.labels[key]}`} size="small" key={key} color="primary" sx={{ mr: 1 }} />
                })}</TableCell>
                <TableCell>
                    {row.restarts}
                </TableCell>
                <TableCell>
                    {moment(row.workload_info.creation_date).fromNow()}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Request Memory / Limit Memory</TableCell>
                                        <TableCell>Request CPU / Limit CPU</TableCell>
                                        <TableCell>Current Usage Memory</TableCell>
                                        <TableCell>Current Usage CPU</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.workload_info.containers.map((containerRow: any) => (
                                        <TableRow key={containerRow.container_name}>
                                            <TableCell component="th" scope="row">
                                                {containerRow.container_name}
                                            </TableCell>
                                            <TableCell>
                                                <Chip variant="filled" label={`${containerRow.image}`} size="small" color="secondary" sx={{ mr: 1 }} />
                                                <Chip variant="filled" label={`${containerRow.image_version}`} size="small" color="warning" sx={{ mr: 1 }} />
                                                {containerRow.init ? <Chip variant="filled" label="init" size="small" color="error" /> : null}
                                            </TableCell>
                                            <TableCell>
                                                {filesize(containerRow.request_memory).human()} / {filesize(containerRow.limit_memory).human()}
                                            </TableCell>
                                            <TableCell>
                                                {containerRow.request_cpu}m / {containerRow.limit_cpu}m
                                            </TableCell>
                                            <TableCell>
                                                {filesize(containerRow.metrics.memory_usage).human()}
                                            </TableCell>
                                            <TableCell>
                                                {containerRow.metrics.cpu_usage}m
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function Deployment(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [workload, setWorkload] = useState<any>({})
    const [pods, setPods] = useState<any[]>([])
    const [metrics, setMetrics] = useState<any[]>([])
    const [requestMemory, setRequestMemory] = useState<RequestMemory[] | null>(null)
    const [limitMemory, setLimitMemory] = useState<LimitMemory[] | null>(null)
    const [requestCPU, setRequestCPU] = useState<RequestCPU[] | null>(null)
    const [limitCPU, setLimitCPU] = useState<LimitCPU[] | null>(null)


    const paramNamespace = useParams<string>()["namespace"]
    const paramName = useParams<string>()["name"]
    let interval: any = null

    useEffect(() => {
        setLoading(true)

        const fetchFunc = (namespace: string | undefined, name: string | undefined) => {
            const getDeployment = async () => {
                const { data } = await axios.get(`/api/v1/workloads/deployments/${namespace}/${name}`, { headers: { Accept: "application/json" } })
                return data.data
            }

            const requestsM: RequestMemory[] = []
            const limitsM: LimitMemory[] = []

            const requestsC: RequestCPU[] = []
            const limitsC: LimitCPU[] = []

            getDeployment().then(data => {
                if (data.workload.status.ready !== data.workload.status.desired) {
                    data.workload.status.message = "loading"
                } else {
                    data.workload.status.message = "running"
                }

                const pods = data.pods.map((p: any) => {
                    p.workload_info.containers = p.workload_info.containers.map((c: any) => {

                        const containerRequestsMem: RequestMemory[] = p.workload_info.containers.map((c: any) => {
                            return {
                                containerName: c.container_name,
                                podname: p.workload_info.workload_name,
                                value: c.request_memory
                            }
                        })
    
                        const containerLimitsMem: LimitMemory[] = p.workload_info.containers.map((c: any) => {
                            return {
                                containerName: c.container_name,
                                podname: p.workload_info.workload_name,
                                value: c.limit_memory
                            }
                        })

                        const containerRequestsCPU: RequestCPU[] = p.workload_info.containers.map((c: any) => {
                            return {
                                containerName: c.container_name,
                                podname: p.workload_info.workload_name,
                                value: c.request_cpu
                            }
                        })
    
                        const containerLimitsCPU: LimitCPU[] = p.workload_info.containers.map((c: any) => {
                            return {
                                containerName: c.container_name,
                                podname: p.workload_info.workload_name,
                                value: c.limit_cpu
                            }
                        })

                        requestsM.push(...containerRequestsMem)
                        limitsM.push(...containerLimitsMem)

                        requestsC.push(...containerRequestsCPU)
                        limitsC.push(...containerLimitsCPU)

                        for (let i = 0; i < data.metrics.length; i++) {
                            if (p.workload_info.workload_name === data.metrics[i].podname && c.container_name === data.metrics[i].container_name) {
                                return { ...c, metrics: { ...data.metrics[i] } }
                            }
                        }
                        return { ...c, metrics: [] }
                    })



                return p
            })

            setRequestMemory(requestsM)
            setLimitMemory(limitsM)
            setRequestCPU(requestsC)
            setLimitCPU(limitsC)
            setWorkload(data.workload)
            setPods(pods)
            setMetrics(data.metrics)
        }).catch((error) => {
            if (axios.isAxiosError(error)) {
                console.error("failed to retrieve deployment information", error.message)
                setErrorMessage("failed to retrieve deployment information")
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
fetchFunc(paramNamespace, paramName)

// check if already a interval is configured
if (interval) {
    clearInterval(interval)
}
// configure new interval
interval = setInterval(() => {
    fetchFunc(paramNamespace, paramName)
}, props.refreshIntervalMS)

return () => {
    clearInterval(interval)
}

    }, [props.refreshIntervalMS, paramNamespace, paramName]);


return <React.Fragment>
    <PageHead title={`Deployment ${paramName}`} />
    <Box>
        {loading ? <CircularProgress color="primary" /> : <div>
            <Box mb={1}>
                <b>Status: </b> {workload.status.message === "loading" ? <Chip variant="outlined" label={workload.status.message} size="small" color="warning" /> : <Chip variant="outlined" label={workload.status.message} size="small" color="success" />}
            </Box>
            <Box mb={1}>
                <b>Labels: </b> {Object.keys(workload.workload_info.labels).map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.labels[key]}`} size="small" key={key} color="primary" sx={{ mr: 1 }} />
                })}
            </Box>
            <Box mb={1}>
                <b>Annotations: </b>{Object.keys(workload.workload_info.annotations).filter((k) => k !== "cattle.io/status" && k !== 'kubectl.kubernetes.io/last-applied-configuration').map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.annotations[key]}`} size="small" key={key} color="secondary" sx={{ mr: 1 }} />
                })}
            </Box>
            <Box mb={1}>
                <b>Selector: </b>{Object.keys(workload.workload_info.selector).filter((k) => k !== "cattle.io/status" && k !== 'kubectl.kubernetes.io/last-applied-configuration').map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.selector[key]}`} size="small" key={key} color="secondary" sx={{ mr: 1 }} />
                })}
            </Box>
            <Box mb={1}>
                <b>Ready/Desired: </b> {workload.status.desired} / {workload.status.ready}
            </Box>
            <Box mb={1}>
                <b>Creation Timestamp: </b> {moment(workload.workload_info.creation_date).format("YYYY-MM-DD HH:mm")} <Chip variant="outlined" color="secondary" label={moment(workload.workload_info.creation_date).fromNow()} size="small"></Chip>
            </Box>
        </div>}
    </Box>
    <SectionHead title="Metrics" />
    <Box>
        <Grid container spacing={1}>
            <Grid item sm={6}>
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <MemChart data={metrics} limitMemory={limitMemory} requestMemory={requestMemory} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item sm={6}>
            <Card>
                    <CardContent sx={{ p: 3 }}>
                        <CpuChart data={metrics} limitCPU={limitCPU} requestCPU={requestCPU} />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
    <SectionHead title="Pods &amp; Containers" />
    <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
            <TableHead>
                <TableRow>
                    <TableCell />
                    <TableCell>Podname</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Containers</TableCell>
                    <TableCell>Labels</TableCell>
                    <TableCell>Restarts</TableCell>
                    <TableCell>Age</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {pods.map((pod: any) => (
                    <Row key={pod.workload_info.workload_name} row={pod} />
                ))}
            </TableBody>
        </Table>
    </TableContainer>
    <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
        <Alert severity="error">{errorMessage}</Alert>
    </Snackbar>
</React.Fragment>
}

export default Deployment