import { Box, Chip } from "@mui/material"
import moment from "moment";
import React from "react";
import { CronjobStatus, CronjobWorkload } from "../../clients/response_types";
import CommonInfo from "./CommonInfo";

type Props = {
    workload: CronjobWorkload;
}

function CronjobInfoBox(props: Props) {
    const workload: CronjobWorkload = props.workload

    const renderLastScheduledTime = (status: CronjobStatus) => {
        if (status.last_scheduled_time) {
            return <Box mb={1}><b>Last Scheduled Time: </b> {moment(status.last_scheduled_time).format("YYYY-MM-DD HH:mm:ss")} <Chip variant="outlined" color="secondary" label={moment(status.last_scheduled_time).fromNow()} size="small"></Chip></Box>
        }

        return <React.Fragment />
    }

    const renderLastSuccessfulTime = (status: CronjobStatus) => {
        if (status.last_successful_time) {
            return <Box mb={1}><b>Last Successful Time: </b> {moment(status.last_successful_time).format("YYYY-MM-DD HH:mm:ss")} <Chip variant="outlined" color="secondary" label={moment(status.last_successful_time).fromNow()} size="small"></Chip></Box>
        }

        return <React.Fragment />
    }

    return <div>
        <Box mb={1}>
            <b>Active Jobs: </b> {workload.status.active_jobs.length}
        </Box>
        <Box mb={1}>
            <b>Schedule: </b> {workload.schedule}
        </Box>
        <Box mb={1}>
            <b>Concurrency Policy: </b> {workload.concurrency_policy}
        </Box>
        <Box mb={1}>
            <b>Successful Jobs History: </b> {workload.successful_jobs_history}
        </Box>
        <Box mb={1}>
            <b>Failed Jobs History: </b> {workload.failed_jobs_history}
        </Box>
        {workload.backoff_limit ? <Box mb={1}><b>Backoff Limit: </b> {workload.backoff_limit}</Box> : null}
        {renderLastScheduledTime(workload.status)}
        {renderLastSuccessfulTime(workload.status)}
        <CommonInfo workload={workload} />
    </div>
}

export default CronjobInfoBox