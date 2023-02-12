import { Chip, TableCell, TableRow } from "@mui/material"
import React from "react"
import filesize from "file-size";
import { Container, PodContainerMetric } from "../../clients/response_types";

type Props = {
    container: Container
    metrics: Array<PodContainerMetric> | undefined
}

function ContainerInfoRow(props: Props) {
    const container : Container = props.container
    const metrics : Array<PodContainerMetric> = props.metrics || []

    return (<React.Fragment>
        <TableRow key={container.container_name}>
            <TableCell component="th" scope="row">
                {container.container_name}
            </TableCell>
            <TableCell>
                <Chip variant="filled" label={`${container.image}`} size="small" color="secondary" sx={{ mr: 1 }} />
                <Chip variant="filled" label={`${container.image_version}`} size="small" color="warning" sx={{ mr: 1 }} />
                {container.init_container ? <Chip variant="filled" label="init" size="small" color="error" /> : null}
            </TableCell>
            <TableCell>
                {filesize(container.request_memory).human()} / {filesize(container.limit_memory).human()}
            </TableCell>
            <TableCell>
                {container.request_cpu}m / {container.limit_cpu}m
            </TableCell>
            <TableCell>
                {metrics.length > 0 && metrics[metrics.length -1] ? filesize(metrics[metrics.length -1].memory_usage).human() : ""}
            </TableCell>
            <TableCell>
                {metrics.length > 0 && metrics[metrics.length -1] ? `${metrics[metrics.length -1].cpu_usage}m` : ""}
            </TableCell>
        </TableRow>
    </React.Fragment>)
}

export default ContainerInfoRow