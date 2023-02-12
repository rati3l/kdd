import "chartjs-adapter-moment"
import React, { useEffect, useRef, useState } from "react"
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataset, ChartOptions } from 'chart.js';
import { Typography } from "@mui/material";
import { PodContainerMetric, PodWorkload } from "../../clients/response_types";

import annotationPlugin from 'chartjs-plugin-annotation';
import autocolors from 'chartjs-plugin-autocolors';
import zoomPlugin from 'chartjs-plugin-zoom';
import chartTransformers, { ChartData } from "./transformers";
import chartOptions from "./options";
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";

ChartJS.register(annotationPlugin, zoomPlugin, autocolors, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
    metrics: Array<PodContainerMetric>;
    pods: Array<PodWorkload>;
}

function PodsMemChart(props: Props) {
    const chartRef = useRef<ChartJSOrUndefined>(null);
    const pods: Array<PodWorkload> = props.pods || []
    const metrics: Array<PodContainerMetric> = props.metrics || []
    const [data, setData] = useState<any>({
        datasets: [],
    });


    useEffect(() => {
        const chart = chartRef.current
        if (!chart) {
            return
        }
        const transformedData = chartTransformers().transformDataForPodMetricMemChart(pods, metrics)

        const options: any = chartOptions().forContainerMemChartWithAnnotations(transformedData)
        setData({ datasets: transformedData })
        chart.options = options
        chart.update()
    }, [pods, metrics])

    if (data.datasets.length > 0) {
        return <React.Fragment>
            <Chart type='line' data={data} ref={chartRef} />
            <Typography variant="body2">Press Ctrl+Scroll to zoom in.</Typography>
        </React.Fragment>
    } 
    return <React.Fragment />
}

export default PodsMemChart