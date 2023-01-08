import React, { useEffect, useState } from "react"
import PageHead from "../components/PageHead"
import { Box } from "@mui/system";
import { Alert,  CircularProgress, Snackbar } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

type Props = {
    refreshIntervalMS: number;
}

function Namespace(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrrorMessage] = useState("")
    const [namespaceData, setNamespaceData] = useState({})
    const [workloadsData, setWorkloadsData] = useState([])

    const paramName = useParams()["name"]
    let interval: any = null

    useEffect(() => {
        setLoading(true)

        const fetchFunc = (name: string | undefined) => {
            const getNamespace = async () => {
                const { data } = await axios.get(`/api/v1/namespace/${name}`, { headers: { Accept: "application/json" } })
                return data.data
            }

            getNamespace().then(data => {
                setNamespaceData(data.namespace)
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve namespace information", error.message)
                    setErrrorMessage("failed to retrieve namespace information")
                } else {
                    console.error("a unknown error occurred", error)
                    setErrrorMessage("a unknown error occurred")
                }
            }).finally(() => {
                setLoading(false)
            })
        }
        setLoading(true)
        // fetching data initially
        fetchFunc(paramName)

        // check if already a interval is configured
        if (interval) {
            clearInterval(interval)
        }
        // configure new interval
        interval = setInterval(() => {
            fetchFunc(paramName)
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS, paramName]);



    return <React.Fragment>
        <PageHead title={`Namespace ${paramName}`} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <Box></Box>}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage != ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespace