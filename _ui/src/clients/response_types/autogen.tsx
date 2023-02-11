export type ActiveCronjobInfo = {
    api_version: string,
    name: string,
    namespace: string,
}
export type Container = {
    container_name: string,
    image: string,
    image_version: string,
    request_cpu: number,
    request_memory: number,
    limit_cpu: number,
    limit_memory: number,
    restarts: number,
    init_container: boolean,
}
export type CronjobStatus = {
    active_jobs: ActiveCronjobInfo[],
    last_scheduled_time: string,
    last_successful_time: string,
}
export type CronjobWorkload = {
    workload_info: GeneralWorkloadInfo,
    type: string,
    suspend: boolean,
    concurrency_policy: string,
    backoff_limit: number,
    failed_jobs_history: number,
    successful_jobs_history: number,
    schedule: string,
    status: CronjobStatus,
}
export type DaemonSetStatus = {
    desired: number,
    current: number,
    ready: number,
    up2date: number,
    available: number,
}
export type DaemonSetWorkload = {
    workload_info: GeneralWorkloadInfo,
    type: string,
    status: DaemonSetStatus,
}
export type DeploymentStatus = {
    desired: number,
    ready: number,
    available: number,
    up2date: number,
}
export type DeploymentWorkload = {
    workload_info: GeneralWorkloadInfo,
    type: string,
    status: DeploymentStatus,
}
export type Event = {
    last_seen: string,
    first_seen: string,
    count: number,
    name: string,
    namespace: string,
    type: string,
    reason: string,
    message: string,
    object: string,
    source: string,
}
export type GeneralWorkloadInfo = {
    workload_name: string,
    namespace: string,
    labels: Record<string, string>,
    annotations: Record<string, string>,
    selector: Record<string, string>,
    containers: Container[],
    creation_date: string,
}
export type JobStatus = {
    active: number,
    ready: number,
    failed: number,
    succeeded: number,
    start_time: string,
    completion_time: string,
}
export type JobWorkload = {
    workload_info: GeneralWorkloadInfo,
    type: string,
    status: JobStatus,
}
export type Namespace = {
    name: string,
    status: string,
    labels: Record<string, string>,
    annotations: Record<string, string>,
    creation_date: string,
}
export type Node = {
    name: string,
    status: string,
    cpu: number,
    memory: number,
    os_image: string,
    kubelet_version: string,
    roles: string,
    labels: Record<string, string>,
    annotations: Record<string, string>,
    creation_date: string,
}
export type PodContainerMetric = {
    podname: string,
    namespace: string,
    container_name: string,
    cpu_usage: number,
    memory_usage: number,
    creation_date: string,
}
export type PodOwnerRessource = {
    api_version: string,
    kind: string,
    uid: string,
    name: string,
}
export type PodWorkload = {
    workload_info: GeneralWorkloadInfo,
    status: string,
    type: string,
    restarts: number,
    pod_owner_ressources: PodOwnerRessource[],
}
export type StatefulSetStatus = {
    current: number,
    ready: number,
    up2date: number,
    available: number,
    replicas: number,
}
export type StatefulSetWorkload = {
    workload_info: GeneralWorkloadInfo,
    type: string,
    status: StatefulSetStatus,
}
