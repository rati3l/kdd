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

const renderStatus = (params: GridRenderCellParams<any>) => {
    const colorFunc = (type: string) => {
        switch (type) {
            case "failed":
                return "error"
            case "running":
                return "secondary"
            case "succeeded":
                return "success"
            default:
                return "secondary"
        }

    }

    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
}

const renderDuration = () => {
    return (params: GridRenderCellParams<any>) => {
        if (params.value) {
            return params.value?.humanize()
        }
        return ""
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
            return <Link href={`/ui/workloads/jobs/${namespace}/${name}`}>{name}</Link>
        }
    },
    {
        field: 'namespace',
        headerName: 'namespace',
        width: 170,
    },
    {
        field: 'status',
        headerName: 'status',
        width: 100,
        renderCell: renderStatus
    },
    {
        field: 'status_active',
        headerName: 'active',
        width: 100,
    },
    {
        field: 'status_failed',
        headerName: 'failed',
        width: 100,
    },
    {
        field: 'status_succeeded',
        headerName: 'succeeded',
        width: 100,
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
        field: 'start_time',
        headerName: 'start time',
        width: 200,
        renderCell: renderDate()
    },
    {
        field: 'completion_time',
        headerName: 'completion time',
        width: 200,
        renderCell: renderDate()
    },
    {
        field: 'duration',
        headerName: 'duration',
        width: 200,
        renderCell: renderDuration()
    }
];

type Props = {
    rows: any[];
    height: string;
}

function JobDataGrid(props: Props) {
    const flatten_rows: any = props.rows.map((row) => {

        const statusToString = (status: any) => {
            if (status.active > 0) {
                return "running"
            }

            if (status.failed > 0) {
                return "failed"
            }

            if (status.succeeded > 0) {
                return "succeeded"
            }
        }

        const calculate_duration = (status: any) => {
            if (status.completion_time) {
                return moment.duration(moment(status.completion_time).diff(moment(status.start_time)));
            }

            return null
        }

        return {
            workload_name: row.workload_info.workload_name,
            namespace: row.workload_info.namespace,
            creation_date: row.workload_info.creation_date,
            start_time: row.status.start_time,
            completion_time: row.status.completion_time,
            annotations: row.workload_info.annotations || {},
            labels: row.workload_info.labels || {},
            selector: row.workload_info.selector || {},
            status: statusToString(row.status),
            status_active: row.status.active,
            status_failed: row.status.failed,
            status_succeeded: row.status.succeeded,
            duration: calculate_duration(row.status)
        }
    })
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={flatten_rows} columns={columns} sx={{ height: props.height }} />
}

export default JobDataGrid