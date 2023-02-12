import { Box, Chip } from "@mui/material"
import { StatefulSetWorkload } from "../../clients/response_types";
import CommonInfo from "./CommonInfo";

type Props = {
    workload: StatefulSetWorkload;
}

function StatefulSetInfoBox(props: Props) {
    const workload: StatefulSetWorkload = props.workload

    const getStatusAsString = (workload: StatefulSetWorkload) => {
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