import { Chip, Link, Stack } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import React from "react";
import StyledDataGrid from "./base/StyledDataGrid";
import { DaemonSetWorkload } from "../../clients/response_types";
import dataGridTransformers from "./transformers";

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
            return <Link href={`/ui/workloads/daemonsets/${namespace}/${name}`}>{name}</Link>
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
    daemonsets: Array<DaemonSetWorkload>;
    height: string;
}

function DaemonSetDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForDaemonsetDataGrid(props.daemonsets)} columns={columns} sx={{ height: props.height }} />
}

export default DaemonSetDataGrid