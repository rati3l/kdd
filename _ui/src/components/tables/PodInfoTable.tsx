import React from "react";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import { PodContainerMetric, PodWorkload } from "../../clients/response_types";
import SectionHead from "../commons/SectionHead";
import PodInfoRow from "./PodInfoRow";

type Props = {
    title: string;
    pods: Array<PodWorkload>
    metrics: Array<PodContainerMetric>
}

function PodInfoTable(props: Props) {
    const pods : Array<PodWorkload> = props.pods || []
    const metrics : Array<PodContainerMetric> = props.metrics || []

    return (
        <React.Fragment>
            <SectionHead title={props.title} />
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Podname</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Containers</TableCell>
                            <TableCell>Labels</TableCell>
                            <TableCell>Restarts</TableCell>
                            <TableCell>Age</TableCell>
                        </TableRow>
                    </TableHead>
                    {pods.map(pod => {
                        return <PodInfoRow pod={pod} metrics={metrics.filter(x => x.podname === pod.workload_info.workload_name)}/>
                    })}
                </Table>
            </TableContainer>
        </React.Fragment>)
}

export default PodInfoTable