import { Chip, Link, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import { styled } from '@mui/material/styles';
import React from "react";

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



const renderDate = () => {
    return (params: GridRenderCellParams<any>) => {
        return moment(params?.value).fromNow()
    }
}

const renderChips = (color: any) => {
    return (params: GridRenderCellParams<any>) => {
        if (params.value) {
            return <Stack direction="row" sx={{ width: 380, flexWrap: "wrap" }}>{Object.keys(params.value).map((key) => {
                return <Chip title={key + "=" + params?.value[key]} label={key + "=" + params?.value[key]} sx={{ marginRight: "5px", marginBottom: "5px" }} size="small" variant="filled" color={color} />
            })}
            </Stack>
        }
        return <React.Fragment />
    }
}


const renderStatus = (params: GridRenderCellParams<any>) => {
    const colorFunc = (type: string) => {
        switch (type) {
            case "loading":
                return "error"
            case "running":
                return "success"
            default:
                return "secondary"
        }

    }

    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
}

const columns: GridColDef[] = [
    {
        field: 'workload_name',
        headerName: 'name',
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
            const name = params.row["workload_name"]
            const namespace = params.row["namespace"]
            return <Link href={`/ui/workloads/deployments/${namespace}/${name}`}>{name}</Link>
        }
    },
    {
        field: 'status',
        headerName: 'status',
        width: 100,
        renderCell: renderStatus,
    },
    {
        field: 'namespace',
        headerName: 'namespace',
        width: 170,
    },
    {
        field: 'status_ready',
        headerName: 'ready',
        width: 80,
    },
    {
        field: 'status_up2date',
        headerName: 'up2date',
        width: 80,
    },
    {
        field: 'status_available',
        headerName: 'available',
        width: 80,
    },
    {
        field: 'selector',
        headerName: 'selector',
        width: 400,
        renderCell: renderChips("primary")
    },
    {
        field: 'labels',
        headerName: 'labels',
        width: 400,
        renderCell: renderChips("primary")
    },
    {
        field: 'annotations',
        headerName: 'annotations',
        width: 400,
        renderCell: renderChips("secondary"),
        hideable: true,
        hide: true,
    },
    {
        field: 'creation_date',
        headerName: 'creation date',
        width: 200,
        renderCell: renderDate()
    },
];

type Props = {
    rows: any[];
    height: string;
}

function DeploymentDataGrid(props: Props) {
    const flatten_rows: any = props.rows.map((row) => {
        return {
            workload_name: row.workload_info.workload_name,
            namespace: row.workload_info.namespace,
            creation_date: row.workload_info.creation_date,
            annotations: row.workload_info.annotations,
            labels: row.workload_info.labels,
            selector: row.workload_info.selector,
            status: (row.status.ready !== row.status.desired) ? "loading" : "running",
            status_ready: `${row.status.ready}/${row.status.desired}`,
            status_available: row.status.available,
            status_up2date: row.status.up2date
        }
    })
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={flatten_rows} columns={columns} sx={{ height: props.height }} />
}

export default DeploymentDataGrid