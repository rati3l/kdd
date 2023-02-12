import filesize from "file-size"
import { ChartData } from "../transformers"

const defaultScales: any = {
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
    }
}

const defaultPlugins: any = {
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
    decimation: {
        enabled: true,
        algorithm: 'min-max'
    }
}

const defaultOptions: any = {
    responsive: true,
    animation: false,
    parsing: false,
}

const forContainerMemChart = (): any => {
    const scales: any = {
        ...defaultScales,
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

    const options: any = {
        ...defaultOptions,
        plugins: {
            ...defaultPlugins,
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
            title: {
                display: true,
                text: 'Memory',
            },
        },
        scales: scales,
    };

    return options
}

const forContainerMemChartWithAnnotations = (transformedData: Array<ChartData>): any => {
    const options = forContainerMemChart()
    if (options["plugins"]) {
        transformedData?.forEach((data: ChartData) => {
            if (data.request) {
                const name: string = `${data.pod_name}_${data.container_name}`;
                const keyName: any = `${name}_request`;
                if (options["plugins"] && options["plugins"]["annotation"] && options["plugins"]["annotation"]["annotations"]) {
                    options["plugins"]["annotation"]["annotations"][keyName] = {
                        label: {
                            display: false,
                            backgroundColor: 'rgba(100,149,237)',
                            content: `${data.pod_name} - ${data.container_name} - Request Mem: ` + filesize(data.request).human(),
                            position: "end",
                        },
                        type: 'line',
                        yMin: data.request,
                        yMax: data.request,
                        borderWidth: 1,
                        borderDash: [6, 6],
                        borderDashOffset: 0,
                        scaleID: 'y',
                        value: () => data.request
                    }
                }
            }

            if (data.limit) {
                const name: string = `${data.pod_name}_${data.container_name}`;
                const keyName: any = `${name}_limit`;
                if (options["plugins"] && options["plugins"]["annotation"] && options["plugins"]["annotation"]["annotations"]) {
                    options["plugins"]["annotation"]["annotations"][keyName] = {
                        label: {
                            display: false,
                            backgroundColor: 'rgba(100,149,237)',
                            content: `${data.pod_name} - ${data.container_name} - Limit Mem: ` + filesize(data.limit).human(),
                            position: "end",
                        },
                        type: 'line',
                        yMin: data.limit,
                        yMax: data.limit,
                        borderWidth: 1,
                        borderDash: [6, 6],
                        borderDashOffset: 0,
                        scaleID: 'y',
                        value: () => data.limit
                    }
                }
            }
        })
    }

    return options
}

const forContainerCPUChartWithAnnotations = (transformedData: Array<ChartData>): any => {
    console.log("cpu transformed options with annotations", transformedData)
    const options = forContainerCPUChart()
    if (options["plugins"]) {
        transformedData?.forEach((data: ChartData) => {
            if (data.request) {
                const name: string = `${data.pod_name}_${data.container_name}`;
                const keyName: any = `${name}_request`;
                if (options["plugins"] && options["plugins"]["annotation"] && options["plugins"]["annotation"]["annotations"]) {
                    options["plugins"]["annotation"]["annotations"][keyName] = {
                        label: {
                            display: false,
                            backgroundColor: 'rgba(100,149,237)',
                            content: `${data.pod_name} - ${data.container_name} - Request CPU: ${data.request}m`,
                            position: "end",
                        },
                        type: 'line',
                        yMin: data.request,
                        yMax: data.request,
                        borderWidth: 1,
                        borderDash: [6, 6],
                        borderDashOffset: 0,
                        scaleID: 'y',
                        value: () => data.request
                    }
                }
            }

            if (data.limit) {
                const name: string = `${data.pod_name}_${data.container_name}`;
                const keyName: any = `${name}_limit`;
                if (options["plugins"] && options["plugins"]["annotation"] && options["plugins"]["annotation"]["annotations"]) {
                    options["plugins"]["annotation"]["annotations"][keyName] = {
                        label: {
                            display: false,
                            backgroundColor: 'rgba(100,149,237)',
                            content: `${data.pod_name} - ${data.container_name} - Request Limit: ${data.limit}m`,
                            position: "end",
                        },
                        type: 'line',
                        yMin: data.limit,
                        yMax: data.limit,
                        borderWidth: 1,
                        borderDash: [6, 6],
                        borderDashOffset: 0,
                        scaleID: 'y',
                        value: () => data.limit
                    }
                }
            }
        })
    }

    return options
}

const forContainerCPUChart = (): any => {
    const scales: any = {
        ...defaultScales,
        "y": {
            title: {
                display: false,
                text: 'CPU'
            },
            ticks: {
                callback: function (value: any) {
                    return `${value}m`
                }
            }
        }
    };

    const options: any = {
        ...defaultOptions,
        plugins: {
            ...defaultPlugins,
            tooltip: {
                callbacks: {
                    label: (ctx: any) => {
                        let label = ctx.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (ctx.parsed.y !== null) {
                            label += `${ctx.parsed.y}m`
                        }

                        return label
                    }
                }
            },
            legend: {
                position: 'left' as const,
            },
            title: {
                display: true,
                text: 'CPU',
            },
        },
        scales: scales,
    };

    return options
}

type ChartOptions = {
    forContainerMemChart: () => any
    forContainerMemChartWithAnnotations: (data: Array<ChartData>) => any
    forContainerCPUChartWithAnnotations: (data: Array<ChartData>) => any
    forContainerCPUChart: () => any
}

const chartOptions = (): ChartOptions => {
    return {
        forContainerMemChart,
        forContainerMemChartWithAnnotations,
        forContainerCPUChart,
        forContainerCPUChartWithAnnotations
    }
}

export default chartOptions