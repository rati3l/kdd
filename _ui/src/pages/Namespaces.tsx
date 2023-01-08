import React, { useEffect, useState } from "react"
import PageHead from "../components/PageHead"
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, Chip, CircularProgress, Link, Snackbar, Stack } from "@mui/material";
import { styled } from '@mui/material/styles';
import moment from "moment";

type Props = {
    refreshIntervalMS: number;
}


const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .MuiDataGrid-renderingZone": {
        maxHeight: "none !important"
    },
    "& .MuiDataGrid-cell": {
        lineHeight: "unset !important",
        maxHeight: "none !important",
        whiteSpace: "normal !important",
        paddingTop: "5px",
        paddingBottom: "5px",
    },
    "& .MuiDataGrid-row": {
        maxHeight: "none !important"
    },
}));


const renderChips = (color: any) => {
    return (params: GridRenderCellParams<any>) => {
        return <Stack direction="row" sx={{ width: 380, flexWrap: "wrap" }}>{Object.keys(params.value).map((key) => {
            return <Chip title={key + "=" + params?.value[key]} label={key + "=" + params?.value[key]} sx={{ marginRight: "5px", marginBottom: "5px" }} size="small" variant="filled" color={color} />
        })}
        </Stack>
    }
}

const renderNamespaceStatus = (params: GridRenderCellParams<any>) => {
    return <Chip sx={{marginBottom: "5px"}} label={params?.value} variant="outlined" color="success" size="small" />
}

const renderAge = () => {
    return (params: GridRenderCellParams<any>) => {
        return moment(params?.value).fromNow()
    }
}

const columns: GridColDef[] = [
    { 
        field: 'name', 
        headerName: 'name', 
        width: 300,
        renderCell: (params: GridRenderCellParams<any>) => {
            return <Link href={`/ui/namespace/${params?.value}`}>{params?.value}</Link>
        }
    },
    { 
        field: 'status', 
        headerName: 'status', 
        width: 200,
        renderCell: renderNamespaceStatus,
    },
    {
        field: 'labels',
        headerName: 'labels',
        width: 400,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        renderCell: renderChips("primary"),
    },
    {
        field: 'annotations',
        headerName: 'annotations',
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        width: 400,
        renderCell: renderChips("secondary"),
    },
    {
        field: 'workloads',
        headerName: 'workloads',
        width: 300,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        renderCell: (params: GridRenderCellParams<any>) => {
            return <div>
                <b>Deployments: </b>{params?.value["deployments"]}<br />
                <b>Daemonsets: </b>{params?.value["daemonsets"]}<br />
                <b>Statefulsets: </b>{params?.value["statefulsets"]}
            </div>
        }
    },
    {
        field: 'creation_date',
        headerName: 'age',
        width: 200,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        renderCell: renderAge(),
    }
    /*
    { field: 'labels', headerName: 'labels', width: 200 },
    */
];

function Namespaces(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrrorMessage] = useState("")
    const [data, setData] = useState([])

    let interval: any = null

    useEffect(() => {

        const getNamespaces = async () => {
            const { data } = await axios.get("/api/v1/namespaces", { headers: { Accept: "application/json" } })
            return data.data
        }
        const getWorkloads = async () => {
            const { data } = await axios.get("/api/v1/workloads", { headers: { Accept: "application/json" } })
            return data.data
        }
        setLoading(true)

        const fetchFunc = () => {
            Promise.all([getNamespaces(), getWorkloads()]).then(([namespaces, workloads]) => {
                setData(namespaces.map((ns: any) => {
                    let statefulsets = 0
                    let daemonsets = 0
                    let deployments = 0

                    workloads.filter((w: any) => w.workload_info.namespace === ns.name).forEach((w: any) => {
                        switch (w.type) {
                            case "Daemonset":
                                daemonsets++
                                break;
                            case "Deployment":
                                deployments++
                                break;
                            case "Statefulset":
                                statefulsets++
                                break
                            default:
                                console.error("unkown workload type found", w.workload_info.type)
                        }
                    })

                    return { ...ns, workloads: { statefulsets, deployments, daemonsets } }
                }))
            }).catch(error => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve namespace information", error.message)
                    setErrrorMessage("failed to retrieve namespace information")
                } else {
                    console.error("a unknown error occurred", error)
                    setErrrorMessage("a unknown error occurred")
                }
            }).finally(() => { setLoading(false) })            
        }

        // fetching data initially
        fetchFunc()
        // check if already a interval is configured
        if (interval) {
            clearInterval(interval)
        }
        // configure new interval
        interval = setInterval(fetchFunc, props.refreshIntervalMS)
        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Namespaces"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <StyledDataGrid getRowId={(row: any) => { return row.name }} rows={data} columns={columns} sx={{ height: "800px" }} />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespaces