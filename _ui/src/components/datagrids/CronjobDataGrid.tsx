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
        if (params.value) {
            return moment(params?.value).fromNow()
        }
        return ""
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

const columns: GridColDef[] = [
    {
        field: 'workload_name',
        headerName: 'name',
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
            const name = params.row["workload_name"]
            const namespace = params.row["namespace"]
            return <Link href={`/ui/workloads/cronjobs/${namespace}/${name}`}>{name}</Link>
        }
    },
    {
        field: 'namespace',
        headerName: 'namespace',
        width: 170,
    },
    {
        field: 'schedule',
        headerName: 'schedule',
        width: 100,
    },
    {
        field: 'suspend',
        headerName: 'suspend',
        width: 100,
    },
    {
        field: 'status_active',
        headerName: 'active',
        width: 100,
    },
    {
        field: 'last_scheduled_time',
        headerName: 'last schedule',
        width: 250,
        renderCell: renderDate()
    },
    {
        field: 'last_successful_time',
        headerName: 'last successful',
        width: 250,
        renderCell: renderDate()
    },
    {
        field: 'selector',
        headerName: 'selector',
        width: 400,
        renderCell: renderChips("primary"),
        hideable: true,
        hide: true,
    },
    {
        field: 'labels',
        headerName: 'labels',
        width: 400,
        renderCell: renderChips("primary"),
        hideable: true,
        hide: true,
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
        headerName: 'age',
        width: 200,
        renderCell: renderDate()
    },
];

type Props = {
    rows: any[];
    height: string;
}

function CronjobDataGrid(props: Props) {
    const flatten_rows: any = props.rows.map((row) => {
        return {
            workload_name: row.workload_info.workload_name,
            namespace: row.workload_info.namespace,
            creation_date: row.workload_info.creation_date,
            active_jobs: row.status.active_jobs.length,
            last_scheduled_time: row.status.last_scheduled_time,
            last_successful_time: row.status.last_successful_time,
            annotations: row.workload_info.annotations || {},
            labels: row.workload_info.labels || {},
            selector: row.workload_info.selector || {},
            suspend: row.suspend,
            schedule: row.schedule
        }
    })
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={flatten_rows} columns={columns} sx={{ height: props.height }} />
}

export default CronjobDataGrid