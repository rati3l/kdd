import React from "react";
import moment from "moment";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContainerInfoTable from "./ContainerInfoTable";
import { Box, Chip, Collapse, IconButton, TableCell, TableRow } from "@mui/material";
import { PodContainerMetric, PodWorkload } from "../../clients/response_types";

type Props = {
    pod: PodWorkload;
    metrics: Array<PodContainerMetric> | undefined
}

function PodInfoRow(props: Props) {
    const pod: PodWorkload = props.pod
    const metrics: Array<PodContainerMetric> = props.metrics || []

    const [open, setOpen] = React.useState<boolean>(false);

    const renderStatusChip = (status: string) => {
        return <Chip variant="outlined" label={status} size="small" color={(status === "Running" || status === "Succeeded" ? "success" : "error")} sx={{ mr: 1 }} />
    }

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{pod.workload_info.workload_name}</TableCell>
                <TableCell>{renderStatusChip(pod.status)}</TableCell>
                <TableCell>{pod.workload_info.containers.length}</TableCell>
                <TableCell>{Object.keys(pod.workload_info.labels).map((key: string) => {
                    return <Chip variant="filled" label={`${key}=${pod.workload_info.labels[key]}`} size="small" key={key} color="primary" sx={{ mr: 1 }} />
                })}</TableCell>
                <TableCell>
                    {pod.restarts}
                </TableCell>
                <TableCell>
                    {moment(pod.workload_info.creation_date).fromNow()}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <ContainerInfoTable containers={pod.workload_info.containers} containerMetrics={metrics} />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default PodInfoRow