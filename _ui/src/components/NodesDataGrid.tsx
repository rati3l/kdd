import { Chip, Link } from "@mui/material";
import { Stack } from "@mui/system";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import { styled } from '@mui/material/styles';

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

const renderStatus = (params: GridRenderCellParams<any>) => {
    const colorFunc = (type: string) => {
        switch (type) {
            case "KubeletReady":
                return "success"
            default:
                return "error"
        }

    }

    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
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
        flex: 1
    },
    {
        field: 'status',
        headerName: 'status',
        flex: 1,
        renderCell: renderStatus,
        minWidth: 80,
    },
    {
        field: 'cpu',
        headerName: 'cpu',
        flex: 1,
        minWidth: 40,
    },
    {
        field: 'memory',
        headerName: 'memory',
        flex: 1
    },
    {
        field: 'os_image',
        headerName: 'os_image',
        flex: 1
    },
    {
        field: 'kubelet_version',
        headerName: 'kubelet',
        flex: 1
    },
    {
        field: 'roles',
        headerName: 'roles',
        flex: 1
    },
    {
        field: 'labels',
        headerName: 'labels',
        flex: 1,
        minWidth: 400,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        renderCell: renderChips("primary"),
    },
    {
        field: 'annotations',
        headerName: 'annotations',
        flex: 1,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        minWidth: 400,
        renderCell: renderChips("secondary"),
    },
    {
        field: 'creation_date',
        headerName: 'age',
        flex: 1,
        width: 200,
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
        renderCell: renderAge(),
    }

];

type Props = {
    rows: any[];
}

function NodesDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={props.rows} columns={columns} sx={{ height: "800px" }} />
}

export default NodesDataGrid