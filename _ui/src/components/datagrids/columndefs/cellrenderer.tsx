import { Chip, Link, Stack } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import React from "react";
import { WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from "../../../constants";
import { buildWorkloadLink, isWorkloadType } from "../../../utils";

export type CellRenderFunc = (params: GridRenderCellParams<any, any, any>) => React.ReactNode;

export const renderName = (type: string): CellRenderFunc => {
    return (params: GridRenderCellParams<any, any, any>): React.ReactNode => {
        const name = params.row["workload_name"]
        const namespace = params.row["namespace"]
        if (isWorkloadType(type)) {
            return <Link href={buildWorkloadLink(type, namespace, name)}>{name}</Link>
        }
        return name
    }
}

export const renderNamespace = (): CellRenderFunc => {
    return (params: GridRenderCellParams<any, any, any>): React.ReactNode => {
        const namespace = params.row["namespace"]
        return <Link href={`/ui/namespaces/${namespace}`}>{namespace}</Link>
    }
}

export const renderHumanizedDate = (): CellRenderFunc => {
    return (params: GridRenderCellParams<any, any, any>): React.ReactNode => {
        return moment(params?.value).fromNow()
    }
}

export const renderLabels = (color: any): CellRenderFunc => {
    return (params: GridRenderCellParams<any, any, any>): React.ReactNode => {
        if (params.value) {
            return <Stack direction="row" sx={{ width: 380, flexWrap: "wrap" }}>{Object.keys(params.value).map((key) => {
                return <Chip title={key + "=" + params?.value[key]} label={key + "=" + params?.value[key]} sx={{ marginRight: "5px", marginBottom: "5px" }} size="small" variant="filled" color={color} />
            })}
            </Stack>
        }
        return <React.Fragment />
    }
}

export const renderStatus = (type: string): CellRenderFunc => {
    return (params: GridRenderCellParams<any, any, any>): React.ReactNode => {
        const colorFunc = (status: string) => {
            if (type === WORKLOAD_TYPE_DEPLOYMENTS || type === WORKLOAD_TYPE_DEAEMONSET || type === WORKLOAD_TYPE_STATEFULSETS) {
                switch (status.toLocaleLowerCase()) {
                    case "loading":
                        return "error"
                    case "running":
                        return "success"
                    default:
                        return "secondary"
                }
            } else if (type === WORKLOAD_TYPE_PODS) {
                switch (status.toLocaleLowerCase()) {
                    case "running":
                    case "succeeded":
                        return "success"
                    default:
                        return "error"
                }
            } else if (type === WORKLOAD_TYPE_JOBS) {
                switch (status.toLocaleLowerCase()) {
                    case "failed":
                        return "error"
                    case "running":
                        return "secondary"
                    case "succeeded":
                        return "success"
                    default:
                        return "secondary"
                }
            }
        }

        return <Chip sx={{ marginBottom: "5px" }} label={params?.value} variant="outlined" color={colorFunc(params?.value)} size="small" />
    }
}

export const renderHumanizedDuration = (): CellRenderFunc => {
    return (params: GridRenderCellParams<any>) => {
        if (params.value) {
            return params.value?.humanize()
        }
        return ""
    }
}