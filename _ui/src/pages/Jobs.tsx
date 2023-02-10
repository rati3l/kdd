import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import JobDataGrid from "../components/datagrids/JobDataGrid";

type Props = {
    refreshIntervalMS: number;
}

function Jobs(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState([])

    useEffect(() => {
        setLoading(true)

        const fetchFunc = () => {
            const getJobs = async () => {
                const { data } = await axios.get(`/api/v1/workloads/jobs`, { headers: { Accept: "application/json" } })
                return data.data
            }

            getJobs().then(data => {
                setData(data)
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve workload jobs information", error.message)
                    setErrorMessage("failed to retrieve workload jobs information")
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

        const interval: any = setInterval(() => {
            fetchFunc()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }
    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Workloads - Jobs"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <JobDataGrid rows={data} height="800px" />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Jobs