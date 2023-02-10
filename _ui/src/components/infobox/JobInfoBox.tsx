import { Box, Chip } from "@mui/material"
import CommonInfo from "./CommonInfo";

type Props = {
    workload: any;
}

function JobInfoBox(props: Props) {
    const workload = props.workload

    const getStatusAsString = (workload: any) => {
        if (workload.status.active > 0) {
            return "running"
        }

        if (workload.status.failed > 0) {
            return "failed"
        }

        if (workload.status.succeeded > 0) {
            return "succeeded"
        }
        return "unknown"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running":
                return "warning"
            case "failed":
                return "error"
            case "succeeded":
                return "success"
            default:
                return "primary"
        }
    }

    return <div>
        <Box mb={1}>
            <b>Status: </b> <Chip variant="outlined" label={getStatusAsString(workload)} size="small" color={getStatusColor(getStatusAsString(workload))} />
        </Box>
        <CommonInfo workload={workload} />
    </div>
}

export default JobInfoBox