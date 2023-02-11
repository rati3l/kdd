import { GridColDef } from "@mui/x-data-grid"
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants"
import { renderCPU, renderEventStatus, renderHumanizedDate, renderHumanizedDuration, renderLabels, renderMemory, renderWorkloadName, renderNamespace, renderNamespaceStatus, renderNodeStatus, renderWorkloadStatus, renderNamespaceName, renderNamespaceWorkloadCounts } from "./cellrenderer"

const namespace: GridColDef = {
    field: 'namespace',
    headerName: 'namespace',
    width: 170,
    renderCell: renderNamespace()
}

const workloadName = (type: string): GridColDef => {
    return {
        field: 'workload_name',
        headerName: 'name',
        width: 200,
        renderCell: renderWorkloadName(type)
    }
}

const status = (type: string): GridColDef => {
    return {
        field: 'status',
        headerName: 'status',
        width: 100,
        renderCell: renderWorkloadStatus(type),
    }
}

const selector: GridColDef = {
    field: 'selector',
    headerName: 'selector',
    width: 400,
    renderCell: renderLabels("primary")
}

const labels: GridColDef = {
    field: 'labels',
    headerName: 'labels',
    width: 400,
    renderCell: renderLabels("primary")
}

const annotations: GridColDef = {
    field: 'annotations',
    headerName: 'annotations',
    width: 400,
    hideable: true,
    hide: true,
    renderCell: renderLabels("primary")
}

const creationDate: GridColDef = {
    field: 'creation_date',
    headerName: 'creation date',
    width: 200,
    renderCell: renderHumanizedDate()
}

const getDeploymentDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_DEPLOYMENTS) },
        { ...status(WORKLOAD_TYPE_DEPLOYMENTS) },
        { ...namespace },
        {
            field: 'status_up2date',
            headerName: 'up2date',
            width: 80,
        },
        {
            field: 'status_available',
            headerName: 'available',
            width: 80,
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        { ...creationDate },
    ]
}

const getDaemonsetDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_DEAEMONSET) },
        { ...status(WORKLOAD_TYPE_DEAEMONSET) },
        { ...namespace },
        {
            field: 'status_ready',
            headerName: 'ready',
            width: 80,
        },
        {
            field: 'status_up2date',
            headerName: 'up2date',
            width: 80,
        },
        {
            field: 'status_available',
            headerName: 'available',
            width: 80,
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        { ...creationDate },
    ]
}

const getStatefulsetDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_STATEFULSETS) },
        { ...status(WORKLOAD_TYPE_STATEFULSETS) },
        { ...namespace },
        {
            field: 'status_ready',
            headerName: 'ready',
            width: 80,
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        { ...creationDate },
    ]
}

const getPodDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_PODS) },
        { ...status(WORKLOAD_TYPE_PODS) },
        { ...namespace },
        {
            field: 'count_containers',
            headerName: 'containers',
            width: 80,
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        {
            field: 'restarts',
            headerName: 'Restarts',
            width: 80,
        },
        { ...creationDate },
    ]
}

const getCronjobDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_CRONJOBS) },
        { ...namespace },
        {
            field: 'schedule',
            headerName: 'schedule',
            width: 100,
        },
        {
            field: 'suspend',
            headerName: 'suspend',
            width: 100,
        },
        {
            field: 'status_active',
            headerName: 'active',
            width: 100,
        },
        {
            field: 'last_scheduled_time',
            headerName: 'last schedule',
            width: 250,
            renderCell: renderHumanizedDate()
        },
        {
            field: 'last_successful_time',
            headerName: 'last successful',
            width: 250,
            renderCell: renderHumanizedDate()
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        { ...creationDate },
    ]
}

const getJobDataGridColumnDefs = (): GridColDef[] => {
    return [
        { ...workloadName(WORKLOAD_TYPE_JOBS) },
        { ...namespace },
        { ...status(WORKLOAD_TYPE_JOBS) },
        {
            field: 'status_active',
            headerName: 'active',
            width: 100,
        },
        {
            field: 'status_failed',
            headerName: 'failed',
            width: 100,
        },
        {
            field: 'status_succeeded',
            headerName: 'succeeded',
            width: 100,
        },
        { ...selector },
        { ...labels },
        { ...annotations },
        {
            field: 'start_time',
            headerName: 'start time',
            width: 200,
            renderCell: renderHumanizedDate()
        },
        {
            field: 'completion_time',
            headerName: 'completion time',
            width: 200,
            renderCell: renderHumanizedDate()
        },
        {
            field: 'duration',
            headerName: 'duration',
            width: 200,
            renderCell: renderHumanizedDuration()
        },
        { ...creationDate },
    ]
}

const getEventDataGridColumnDefs = (): GridColDef[] => {
    return [
        {
            field: 'last_seen',
            headerName: 'last seen',
            width: 200,
            renderCell: renderHumanizedDate()
        },
        {
            field: 'first_seen',
            headerName: 'first seen',
            width: 200,
            renderCell: renderHumanizedDate()
        },
        {
            field: 'type',
            headerName: 'type',
            width: 200,
            renderCell: renderEventStatus(),
        },
        {
            field: 'message',
            headerName: 'message',
            width: 400,
        },
        {
            field: 'object',
            headerName: 'object',
            width: 400,
        },
    ];
}

const getNodeDataGridColumnDefs = (): GridColDef[] => {
    return [
        {
            field: 'name',
            headerName: 'name',
            flex: 1
        },
        {
            field: 'status',
            headerName: 'status',
            flex: 1,
            renderCell: renderNodeStatus(),
            minWidth: 80,
        },
        {
            field: 'cpu',
            headerName: 'cpu',
            flex: 1,
            minWidth: 40,
            renderCell: renderCPU()
        },
        {
            field: 'memory',
            headerName: 'memory',
            flex: 1,
            renderCell: renderMemory()
        },
        {
            field: 'os_image',
            headerName: 'os_image',
            flex: 1
        },
        {
            field: 'kubelet_version',
            headerName: 'kubelet',
            flex: 1
        },
        {
            field: 'roles',
            headerName: 'roles',
            flex: 1
        },
        { ...labels },
        { ...annotations },
        { ...creationDate },
    ];
}

const getNamespaceDataGridColumnDefs = (): GridColDef[] => {
    return [
        {
            field: 'name',
            headerName: 'name',
            width: 300,
            renderCell: renderNamespaceName()
        },
        {
            field: 'status',
            headerName: 'status',
            width: 200,
            renderCell: renderNamespaceStatus(),
        },
        { ...labels },
        { ...annotations },
        {
            field: 'workloads',
            headerName: 'workloads',
            width: 300,
            disableColumnMenu: true,
            filterable: false,
            sortable: false,
            renderCell: renderNamespaceWorkloadCounts(),
        },
        { ...creationDate }
    ];
}

type ColumnDefs = {
    forDeployments: () => GridColDef[];
    forDeamonsets: () => GridColDef[];
    forStatefulsets: () => GridColDef[];
    forPods: () => GridColDef[];
    forCronjobs: () => GridColDef[];
    forJobs: () => GridColDef[];
    forEvents: () => GridColDef[];
    forNodes: () => GridColDef[];
    forNamespaces: () => GridColDef[];
}

export default function columnDefs(): ColumnDefs {
    const w: ColumnDefs = {
        forDeployments: getDeploymentDataGridColumnDefs,
        forDeamonsets: getDaemonsetDataGridColumnDefs,
        forStatefulsets: getStatefulsetDataGridColumnDefs,
        forPods: getPodDataGridColumnDefs,
        forCronjobs: getCronjobDataGridColumnDefs,
        forJobs: getJobDataGridColumnDefs,
        forEvents: getEventDataGridColumnDefs,
        forNodes: getNodeDataGridColumnDefs,
        forNamespaces: getNamespaceDataGridColumnDefs,
    }

    return w
}