import React from "react"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import moment from "moment";
import "chartjs-adapter-moment"
import annotationPlugin from 'chartjs-plugin-annotation';
import autocolors from 'chartjs-plugin-autocolors';
import filesize from "file-size";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Typography } from "@mui/material";

ChartJS.register(annotationPlugin, zoomPlugin, autocolors, CategoryScale, TimeScale, TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const scales: any = {
    "x": {
        type: 'timeseries',
        time: {
            tooltipFormat: 'YYYY-MM-DD, HH:mm',
            displayFormats: {
                hour: 'DD MMM, HH:mm'
            }
        },
        ticks: {
            source: 'auto',
            // Disabled rotation for performance
            maxRotation: 0,
            autoSkip: true,
            align: "start",
        },
        title: {
            display: false,
            text: 'Date'
        }
    },
    "y": {
        title: {
            display: false,
            text: 'Memory'
        },
        ticks: {
            callback: function (value: any) {
                return filesize(value).human();
            }
        }
    }
};

const memChartOptions: any = {
    responsive: true,
    animation: false,
    parsing: false,
    plugins: {
        annotation: {
            annotations: {

            }
        },
        autocolors: {
            mode: 'dataset'
        },
        zoom: {
            pan: {
                enabled: true,
                mode: 'xy'
            },
            limits: {
                y: { "min": "original", max: "original" }
            },
            zoom: {
                wheel: {
                    modifierKey: "ctrl",
                    enabled: true,
                },
                pinch: {
                    enabled: true
                },
                mode: 'xy',
            }
        },
        tooltip: {
            callbacks: {
                label: (ctx: any) => {
                    let label = ctx.dataset.label || '';

                    if (label) {
                        label += ': ';
                    }
                    if (ctx.parsed.y !== null) {
                        label += filesize(ctx.parsed.y).human();
                    }

                    return label
                }
            }
        },
        legend: {
            position: 'right' as const,
        },
        decimation: {
            enabled: true,
            algorithm: 'min-max'
        },
        title: {
            display: true,
            text: 'Memory',
        },
    },
    scales: scales,
};

export type RequestMemory = {
    podname: string;
    containerName: string;
    value: number;
}

export type LimitMemory = {
    podname: string;
    containerName: string;
    value: number;
}

type Props = {
    data: any[];
    requestMemory?: RequestMemory[] | null;
    limitMemory?: LimitMemory[] | null;

}

function MemChart(props: Props) {
    const pods_containers: string[] = []

    props.data.forEach(d => {
        if (pods_containers.filter((x => x === `${d.podname}-${d.container_name}`)).length < 1) {
            pods_containers.push(`${d.podname}-${d.container_name}`)
        }
    })

    const datasets = pods_containers.map((value: string) => {
        return {
            label: value,
            data: props.data.filter(f => `${f.podname}-${f.container_name}` === value).map((d) => {
                return { x: moment(d.creation_date), y: d.memory_usage }
            }).sort((a, b) => {
                return a.x.unix() - b.x.unix()
            })
        }
    })

    const data = {
        datasets
    }
/**
 * 
 * TODO: Fixing labels - the labes should be displayed, when mouse moves over it.
 * 
 */


    if (memChartOptions["plugins"]) {
        props.requestMemory?.forEach((request: RequestMemory) => {
            const name: string = `${request.podname}_${request.containerName}`;
            const keyName: any = `${name}_request`;
            if (memChartOptions["plugins"] && memChartOptions["plugins"]["annotation"] && memChartOptions["plugins"]["annotation"]["annotations"]) {
                memChartOptions["plugins"]["annotation"]["annotations"][keyName] = {
                    label: {
                        display: false,
                        backgroundColor: 'rgba(100,149,237)',
                        content: `${request.podname} - ${request.containerName} - Request Mem: ` + filesize(request.value).human(),
                        position: "end",
                    },
                    type: 'line',
                    yMin: request.value,
                    yMax: request.value,
                    borderWidth: 1,
                    borderDash: [6, 6],
                    borderDashOffset: 0,
                    scaleID: 'y',
                    value: () => request.value
                }
            }
        })

        props.limitMemory?.forEach((limit: LimitMemory) => {
            const name: string = `${limit.podname}_${limit.containerName}`;
            const keyName: any = `${name}_limit`;
            if (memChartOptions["plugins"] && memChartOptions["plugins"]["annotation"] && memChartOptions["plugins"]["annotation"]["annotations"]) {
                memChartOptions["plugins"]["annotation"]["annotations"][keyName] = {
                    label: {
                        display: false,
                        backgroundColor: 'rgba(100,149,237)',
                        content: `${limit.podname} - ${limit.containerName} - Limit Mem:  ${filesize(limit.value).human()}`,
                        position: "end",
                    },
                    type: 'line',
                    yMin: limit.value,
                    yMax: limit.value,
                    borderWidth: 1,
                    borderDash: [6, 6],
                    borderDashOffset: 0,
                    scaleID: 'y',
                    value: () => limit.value
                }
            }
        })
    }

    return <React.Fragment>
        <Line options={memChartOptions} data={data} />
        <Typography variant="body2">Press Ctrl+Scroll to zoom in.</Typography>
    </React.Fragment>
}

export default MemChart