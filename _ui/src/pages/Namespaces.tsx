import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import NamespaceDataGrid from "../components/datagrids/NamespaceDataGrid";

type Props = {
    refreshIntervalMS: number;
}

function Namespaces(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrrorMessage] = useState("")
    const [data, setData] = useState([])

    useEffect(() => {

        const getNamespaces = async () => {
            const { data } = await axios.get("/api/v1/namespaces", { headers: { Accept: "application/json" } })
            return data.data
        }
        const getWorkloads = async () => {
            const { data } = await axios.get("/api/v1/workloads", { headers: { Accept: "application/json" } })
            return data.data
        }
        setLoading(true)

        const fetchFunc = () => {
            Promise.all([getNamespaces(), getWorkloads()]).then(([namespaces, workloads]) => {
                setData(namespaces.map((ns: any) => {
                    let statefulsets = 0
                    let daemonsets = 0
                    let deployments = 0

                    workloads.filter((w: any) => w.workload_info.namespace === ns.name).forEach((w: any) => {
                        switch (w.type) {
                            case "Daemonset":
                                daemonsets++
                                break;
                            case "Deployment":
                                deployments++
                                break;
                            case "Statefulset":
                                statefulsets++
                                break
                            case "Pod":
                                // nothing to do here
                                break
                            default:
                                console.error("unkown workload type found", w.type)
                        }
                    })

                    return { ...ns, workloads: { statefulsets, deployments, daemonsets } }
                }))
            }).catch(error => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve namespace information", error.message)
                    setErrrorMessage("failed to retrieve namespace information")
                } else {
                    console.error("a unknown error occurred", error)
                    setErrrorMessage("a unknown error occurred")
                }
            }).finally(() => { setLoading(false) })
        }

        // fetching data initially
        fetchFunc()

        const interval: any = setInterval(() => {
            fetchFunc()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Namespaces"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <NamespaceDataGrid rows={data} />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespaces