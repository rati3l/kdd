import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import JobDataGrid from "../components/datagrids/JobDataGrid";
import client from "../clients/kdd";
import { JobWorkload } from "../clients/response_types";

type Props = {
    refreshIntervalMS: number;
}

function Jobs(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [jobs, setJobs] = useState<Array<JobWorkload>>([])

    const checkError = (error: any) => {
        if (axios.isAxiosError(error)) {
            console.error("failed to retrieve information", error.message)
            setErrorMessage("failed to retrieve information")
        } else {
            console.error("a unknown error occurred", error)
            setErrorMessage("a unknown error occurred")
        }
    }

    const finishLoading = () => {
        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)

        const load = () => {
            client().getJobs().then((jobs: Array<JobWorkload>) => {
                setJobs(jobs)
            }).catch(checkError).finally(finishLoading)
        }

        load()
        const interval: any = setInterval(() => {
            load()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }
    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Workloads - Jobs"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <JobDataGrid jobs={jobs} height="800px" />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Jobs