import { Chip, Link } from "@mui/material";
import { Stack } from "@mui/system";
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

const renderNamespaceStatus = (params: GridRenderCellParams<any>) => {
    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color="success" size="small" />
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

type Props = {
    rows: any[];
}

function NamespaceDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={props.rows} columns={columns} sx={{ height: "800px" }} />
}

export default NamespaceDataGrid