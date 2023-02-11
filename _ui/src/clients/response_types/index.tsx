import { CronjobWorkload, DaemonSetWorkload, DeploymentWorkload, JobWorkload, PodWorkload, StatefulSetWorkload } from "./autogen"

export * from "./autogen"
export type Workload = DeploymentWorkload | StatefulSetWorkload | DaemonSetWorkload | PodWorkload | JobWorkload | CronjobWorkload
