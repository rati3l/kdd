import moment from "moment";
import { Container, PodContainerMetric, PodWorkload } from "../../../clients/response_types"

export type ChartData = {
    pod_name: string;
    container_name: string;
    limit: number;
    request: number;
    label: string;
    data: Array<GraphData>;
}

type GraphData = {
    x: moment.Moment;
    y: number;
}

type ChartDataTransformer = {
    transformDataForPodMetricMemChart: (pods: Array<PodWorkload>, metrics: Array<PodContainerMetric>) => Array<ChartData>
    transformDataForPodMetricCPUChart: (pods: Array<PodWorkload>, metrics: Array<PodContainerMetric>) => Array<ChartData>
}

const transformDataForPodMetricMemChart = (pods: Array<PodWorkload>, metrics: Array<PodContainerMetric>): Array<ChartData> => {
    let result: Array<ChartData> = []
    pods.forEach((p: PodWorkload) => {
        const data: Array<ChartData> = p.workload_info.containers.map((c: Container): ChartData => {
            return {
                pod_name: p.workload_info.workload_name,
                container_name: c.container_name,
                request: c.request_memory,
                limit: c.limit_memory,
                label: `${p.workload_info.workload_name} - ${c.container_name}`,
                data: metrics.filter(m => m.container_name === c.container_name && m.podname === p.workload_info.workload_name).map((m: PodContainerMetric) => {
                    return { x: moment(m.creation_date), y: m.memory_usage }
                }).sort((a, b) => {
                    return a.x.unix() - b.x.unix()
                }),
            }
        })
        console.log("transform", data)
        result.push(...data) 
    })

    return result
}

const transformDataForPodMetricCPUChart = (pods: Array<PodWorkload>, metrics: Array<PodContainerMetric>): Array<ChartData> => {
    let result: Array<ChartData> = []
    pods.forEach((p: PodWorkload) => {
        const data: Array<ChartData> = p.workload_info.containers.map((c: Container): ChartData => {
            return {
                pod_name: p.workload_info.workload_name,
                container_name: c.container_name,
                request: c.request_cpu,
                limit: c.limit_cpu,
                label: `${p.workload_info.workload_name} - ${c.container_name}`,
                data: metrics.filter(m => m.container_name === c.container_name && m.podname === p.workload_info.workload_name).map((m: PodContainerMetric) => {
                    return { x: moment(m.creation_date), y: m.cpu_usage }
                }).sort((a, b) => {
                    return a.x.unix() - b.x.unix()
                }),
            }
        })
        result.push(...data) 
    })

    console.log("transformDataForPodMetricCPUChart ", result);

    return result
}

export default function chartTransformers(): ChartDataTransformer {
    return {
        transformDataForPodMetricMemChart, 
        transformDataForPodMetricCPUChart
    }
}
