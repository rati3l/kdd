import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { Container, PodContainerMetric } from "../../clients/response_types"
import ContainerInfoRow from "./ContainerInfoRow"

type Props = {
    containers: Array<Container>
    containerMetrics: Array<PodContainerMetric>
}

function ContainerInfoTable(props: Props) {
    const containers = props.containers || []
    const containerMetrics = props.containerMetrics || []
    return (
        <Table size="small" aria-label="containers">
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Request Memory / Limit Memory</TableCell>
                    <TableCell>Request CPU / Limit CPU</TableCell>
                    <TableCell>Current Usage Memory</TableCell>
                    <TableCell>Current Usage CPU</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {containers.map(c => {
                    
                    return <ContainerInfoRow container={c} metrics={containerMetrics.filter(m => m.container_name === c.container_name)}/>
                })}
            </TableBody>
        </Table>
    )
}

export default ContainerInfoTable