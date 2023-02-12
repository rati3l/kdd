import "chartjs-adapter-moment"
import React from "react"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Typography } from "@mui/material";
import { PodContainerMetric, PodWorkload } from "../../clients/response_types";

import annotationPlugin from 'chartjs-plugin-annotation';
import autocolors from 'chartjs-plugin-autocolors';
import zoomPlugin from 'chartjs-plugin-zoom';
import chartTransformers, { ChartData } from "./transformers";
import chartOptions from "./options";

ChartJS.register(annotationPlugin, zoomPlugin, autocolors, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
    metrics: Array<PodContainerMetric>;
    pods: Array<PodWorkload>;
}

function PodsCPUChart(props: Props) {
    const pods: Array<PodWorkload> = props.pods || []
    const metrics: Array<PodContainerMetric> = props.metrics || []
/*
    let options: any = {}
    let optionsCacheKey: string = ""

    const initOptions = (pods: Array<PodWorkload>, data: Array<ChartData>): void => {
        const key: string = pods.map((p: PodWorkload): string => {
            return `${p.workload_info.workload_name}_${p.workload_info.namespace}`
        }).join("cpu")

        if (key !== optionsCacheKey) {
            optionsCacheKey = key
            options = chartOptions().forContainerCPUChartWithAnnotations(data)
        }
    }
*/
    const transformedData = chartTransformers().transformDataForPodMetricCPUChart(pods, metrics)
    const options = chartOptions().forContainerCPUChartWithAnnotations(transformedData)
    console.log("options", options)
    const data = { datasets: transformedData }

    if (Object.keys(options).length > 0) {
        return <React.Fragment>
            <Line options={options} data={data} />
            <Typography variant="body2">Press Ctrl+Scroll to zoom in.</Typography>
        </React.Fragment>
    }
    return <React.Fragment />
}

export default PodsCPUChart