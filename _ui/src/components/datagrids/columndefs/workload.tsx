import { GridColDef } from "@mui/x-data-grid"
import { WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants"
import { renderHumanizedDate, renderLabels, renderName, renderNamespace, renderStatus } from "./cellrenderer"

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
        renderCell: renderName(type)
    }
}

const status = (type: string): GridColDef => {
    return {
        field: 'status',
        headerName: 'status',
        width: 100,
        renderCell: renderStatus(type),
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

type WorkloadColumnsDefs = {
    forDeployments: () => GridColDef[];
    forDeamonsets: () => GridColDef[];
    forStatefulsets: () => GridColDef[];
    forPods: () => GridColDef[];
}

export default function workloadColumnDefs(): WorkloadColumnsDefs {
    const w: WorkloadColumnsDefs = {
        forDeployments: getDeploymentDataGridColumnDefs,
        forDeamonsets: getDaemonsetDataGridColumnDefs,
        forStatefulsets: getStatefulsetDataGridColumnDefs,
        forPods: getPodDataGridColumnDefs,
    }

    return w
}