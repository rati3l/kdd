import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import CronjobDataGrid from "../components/datagrids/CronjobDataGrid";

type Props = {
    refreshIntervalMS: number;
}

function Cronjobs(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState([])

    let interval: any = null
    useEffect(() => {
        setLoading(true)

        const fetchFunc = () => {
            const getJobs = async () => {
                const { data } = await axios.get(`/api/v1/workloads/cronjobs`, { headers: { Accept: "application/json" } })
                return data.data
            }

            getJobs().then(data => {
                setData(data)
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve workload cronjobs information", error.message)
                    setErrorMessage("failed to retrieve workload cronjobs information")
                } else {
                    console.error("a unknown error occurred", error)
                    setErrorMessage("a unknown error occurred")
                }
            }).finally(() => {
                setLoading(false)
            })
        }
        setLoading(true)
        // fetching data initially
        fetchFunc()

        // check if already a interval is configured
        if (interval) {
            clearInterval(interval)
        }
        // configure new interval
        interval = setInterval(() => {
            fetchFunc()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Workloads - Cronjobs"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <CronjobDataGrid rows={data} height="800px" />}
        </Box>

        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Cronjobs