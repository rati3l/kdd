import { Chip } from "@mui/material"
import { Box } from "@mui/system"
import CommonInfo from "./CommonInfo"

type Props = {
    workload: any;
}

function PodInfoBox(props: Props) {
    const workload = props.workload

    const getStatusColor = (status: string) => {
        switch (status.toLocaleLowerCase()) {
            case "running":
            case "succeeded":
            case "completed":
                return "success"
            default:
                return "error"
        }
    }

    return (<div>
        <Box mb={1}>
            <b>Status: </b><Chip variant="outlined" label={workload.status} size="small" color={getStatusColor(workload.status)} />
        </Box>
        <CommonInfo workload={workload} />
    </div>)
}

export default PodInfoBox