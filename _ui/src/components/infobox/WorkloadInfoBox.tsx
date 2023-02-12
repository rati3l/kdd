import React from "react";
import { CronjobWorkload, DaemonSetWorkload, DeploymentWorkload, JobWorkload, PodWorkload, StatefulSetWorkload, Workload } from "../../clients/response_types";
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../constants";
import CronjobInfoBox from "./CronjobInfoBox";
import DaemonSetInfoBox from "./DaemonSetInfoBox";
import DeploymentInfoBox from "./DeploymentInfoBox";
import JobInfoBox from "./JobInfoBox";
import PodInfoBox from "./PodInfoBox";
import StatefulSetInfoBox from "./StatefulSetInfoBox";

type Props = {
    workload: Workload | undefined;
}

function WorkloadInfoBox(props: Props) {
    if (!props.workload) {
        return <React.Fragment />
    }
    switch (props.workload.type) {
        case WORKLOAD_TYPE_DEPLOYMENTS:
            return <DeploymentInfoBox workload={props.workload as DeploymentWorkload}></DeploymentInfoBox>
        case WORKLOAD_TYPE_DEAEMONSET:
            return <DaemonSetInfoBox workload={props.workload as DaemonSetWorkload}></DaemonSetInfoBox>
        case WORKLOAD_TYPE_STATEFULSETS:
            return <StatefulSetInfoBox workload={props.workload as StatefulSetWorkload}></StatefulSetInfoBox>
        case WORKLOAD_TYPE_JOBS:
            return <JobInfoBox workload={props.workload as JobWorkload}></JobInfoBox>
        case WORKLOAD_TYPE_CRONJOBS:
            return <CronjobInfoBox workload={props.workload as CronjobWorkload}></CronjobInfoBox>
        case WORKLOAD_TYPE_PODS:
            return <PodInfoBox workload={props.workload as PodWorkload}></PodInfoBox>
        default:
            return <React.Fragment />
    }
}

export default WorkloadInfoBox