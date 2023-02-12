import { CronjobWorkload, DaemonSetWorkload, DeploymentWorkload, JobWorkload, PodContainerMetric, PodWorkload, StatefulSetWorkload } from "./autogen"

export * from "./autogen"
export type Workload = DeploymentWorkload | StatefulSetWorkload | DaemonSetWorkload | PodWorkload | JobWorkload | CronjobWorkload

export type CombinedWorkloadInfo = {
    workload: Workload,
    pods: Array<PodWorkload>
    metrics: Array<PodContainerMetric>
}