import { Box, Chip } from "@mui/material"
import CommonInfo from "./CommonInfo";

type Props = {
    workload: any;
}

function StatefulSetInfoBox(props: Props) {
    const workload = props.workload

    const getStatusAsString = (workload: any) => {
        if (workload.status.ready !== workload.status.replicas) {
            return "loading"
        } else {
            return "running"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running":
                return "success"
            case "loading":
                return "warning"
            default:
                return "primary"
        }
    }    

    return <div>
        <Box mb={1}>
            <b>Status: </b> <Chip variant="outlined" label={getStatusAsString(workload)} size="small" color={getStatusColor(getStatusAsString(workload))} />
        </Box>
        <Box mb={1}>
            <b>Ready/Replicas: </b> {workload.status.ready} / {workload.status.replicas}
        </Box>
        <CommonInfo workload={workload} />
    </div>
}

export default StatefulSetInfoBox