import { Chip, Link, Stack } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import React from "react";
import { PodWorkload } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import dataGridTransformers from "./transformers";

const renderDate = () => {
    return (params: GridRenderCellParams<any>) => {
        return moment(params?.value).fromNow()
    }
}

const renderChips = (color: any) => {
    return (params: GridRenderCellParams<any>) => {
        if (params.value) {
            return <Stack direction="row" sx={{ width: 480, flexWrap: "wrap" }}>{Object.keys(params.value).map((key) => {
                return <Chip title={key + "=" + params?.value[key]} label={key + "=" + params?.value[key]} sx={{ marginRight: "5px", marginBottom: "5px" }} size="small" variant="filled" color={color} />
            })}
            </Stack>
        }
        return <React.Fragment />
    }
}


const renderStatus = (params: GridRenderCellParams<any>) => {
    const colorFunc = (type: string) => {
        switch (type.toLocaleLowerCase()) {
            case "running":
            case "succeeded":
                return "success"
            default:
                return "error"
        }

    }

    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
}

const columns: GridColDef[] = [
    {
        field: 'workload_name',
        headerName: 'pod name',
        width: 300,
        renderCell: (params: GridRenderCellParams<any>) => {
            const name = params.row["workload_name"]
            const namespace = params.row["namespace"]
            return <Link href={`/ui/workloads/pods/${namespace}/${name}`}>{name}</Link>
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
        field: 'count_containers',
        headerName: 'containers',
        width: 80,
    },
    {
        field: 'labels',
        headerName: 'labels',
        width: 500,
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
        field: 'restarts',
        headerName: 'Restarts',
        width: 80,
    },
    {
        field: 'creation_date',
        headerName: 'Age',
        width: 200,
        renderCell: renderDate()
    },
];

type Props = {
    pods: Array<PodWorkload>;
    height: string;
}

function PodsDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForPodDataGrid(props.pods)} columns={columns} sx={{ height: props.height }} />
}

export default PodsDataGrid