import { Chip } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import filesize from "file-size";
import StyledDataGrid from "./base/StyledDataGrid";
import { Node } from "../../clients/response_types";
import dataGridTransformers from "./transformers";

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

const renderMemory = () => {
    return (params: GridRenderCellParams<any>) => {
        return filesize(params?.value).human()
    }
}

const renderCPU = () => {
    return (params: GridRenderCellParams<any>) => {
        return `${params?.value}m`
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
        renderCell: renderCPU()
    },
    {
        field: 'memory',
        headerName: 'memory',
        flex: 1,
        renderCell: renderMemory()
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
        hideable: true,
        hide: true,
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
    nodes: Array<Node>;
}

function NodesDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={dataGridTransformers().transformDataForNodeDataGrid(props.nodes)} columns={columns} sx={{ height: "800px" }} />
}

export default NodesDataGrid