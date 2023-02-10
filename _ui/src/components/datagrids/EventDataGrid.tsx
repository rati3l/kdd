import { Chip } from "@mui/material";
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

const renderEventType = (params: GridRenderCellParams<any>) => {
    const colorFunc = (type: string) => {
        switch (type) {
            case "Normal":
                return "secondary"
            case "Warning": 
                return "warning"
            case "Error":
                return "error"
            default:
                return "secondary"
        }

    }

    return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
}

const renderDate = () => {
    return (params: GridRenderCellParams<any>) => {
        return moment(params?.value).fromNow()
    }
}


const columns: GridColDef[] = [
    {
        field: 'last_seen',
        headerName: 'last seen',
        width: 200,
        renderCell: renderDate()
    },
    {
        field: 'first_seen',
        headerName: 'first seen',
        width: 200,
        renderCell: renderDate()
    },
    {
        field: 'type',
        headerName: 'type',
        width: 200,
        renderCell: renderEventType,
    },
    {
        field: 'message',
        headerName: 'message',
        width: 400,
    },
    {
        field: 'object',
        headerName: 'object',
        width: 400,
    },
];

type Props = {
    rows: any[];
}

function EventDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={props.rows} columns={columns} sx={{ height: "300px" }} />
}

export default EventDataGrid