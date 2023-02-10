import { Chip } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React from "react";

type Props = {
    workload: any;
}


function CommonInfo(props: Props) {
    const workload = props.workload

    const renderSelectorBlockIfExisting = (workload: any) => {
        if (workload.workload_info.selector) {
            return (<Box mb={1}>
                <b>Selector: </b>{Object.keys(workload.workload_info.selector).filter((k) => k !== "cattle.io/status" && k !== 'kubectl.kubernetes.io/last-applied-configuration').map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.selector[key]}`} size="small" key={key} color="secondary" sx={{ mr: 1 }} />
                })}
            </Box>)
        }
    }

    const renderAnnotationsBlockIfExisting = (workload: any) => {
        if (workload.workload_info.annotations) {
            return (<Box mb={1}>
                <b>Annotations: </b>{Object.keys(workload.workload_info.annotations || {}).filter((k) => k !== "cattle.io/status" && k !== 'kubectl.kubernetes.io/last-applied-configuration').map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.annotations[key]}`} size="small" key={key} color="secondary" sx={{ mr: 1, mb: 1 }} />
                })}
            </Box>)
        }
    }

    const renderLabelsBlockIfExisting = (workload: any) => {
        if (workload.workload_info.labels) {
            return (<Box mb={1}>
                <b>Labels: </b> {Object.keys(workload.workload_info.labels || {}).map((key) => {
                    return <Chip variant="filled" label={`${key}=${workload.workload_info.labels[key]}`} size="small" key={key} color="primary" sx={{ mr: 1, mb: 1 }} />
                })}
            </Box>)
        }
    }

    return (<React.Fragment>
        {renderLabelsBlockIfExisting(workload)}
        {renderAnnotationsBlockIfExisting(workload)}
        {renderSelectorBlockIfExisting(workload)}
        <Box mb={1}>
            <b>Creation Timestamp: </b> {moment(workload.workload_info.creation_date).format("YYYY-MM-DD HH:mm")} <Chip variant="outlined" color="secondary" label={moment(workload.workload_info.creation_date).fromNow()} size="small"></Chip>
        </Box>
    </React.Fragment>)
}

export default CommonInfo