import React from "react";
import CronjobInfoBox from "./CronjobInfoBox";
import DaemonSetInfoBox from "./DaemonSetInfoBox";
import DeploymentInfoBox from "./DeploymentInfoBox";
import JobInfoBox from "./JobInfoBox";
import PodInfoBox from "./PodInfoBox";
import StatefulSetInfoBox from "./StatefulSetInfoBox";

type Props = {
    workload: any | undefined;
}

function WorkloadInfoBox(props: Props) {
    if (!props.workload) {
        return <React.Fragment />
    }
    switch (props.workload.type) {
        case "Deployment":
            return <DeploymentInfoBox workload={props.workload}></DeploymentInfoBox>
        case "Daemonset":
            return <DaemonSetInfoBox workload={props.workload}></DaemonSetInfoBox>
        case "Statefulset":
            return <StatefulSetInfoBox workload={props.workload}></StatefulSetInfoBox>
        case "Job":
            return <JobInfoBox workload={props.workload}></JobInfoBox>
        case "Cronjob":
            return <CronjobInfoBox workload={props.workload}></CronjobInfoBox>
        case "Pod":
            return <PodInfoBox workload={props.workload}></PodInfoBox>
        default:
            return <React.Fragment />
    }
}

export default WorkloadInfoBox