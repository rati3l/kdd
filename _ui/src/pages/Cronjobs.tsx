import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import CronjobDataGrid from "../components/datagrids/CronjobDataGrid";
import { CronjobWorkload } from "../clients/response_types";
import client from "../clients/kdd";

type Props = {
    refreshIntervalMS: number;
}

function Cronjobs(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [cronjobs, setCronjobs] = useState<Array<CronjobWorkload>>([])

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
            client().getCronjobs().then( (jobs : Array<CronjobWorkload>) => {
                setCronjobs(jobs)
            })
                .catch(checkError)
                .finally(finishLoading)
        }

        // fetching data initially
        load()
        const interval: any = setInterval(() => {
            load()
        }, props.refreshIntervalMS)

        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS]);


    return <React.Fragment>
        <PageHead title={"Workloads - Cronjobs"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <CronjobDataGrid cronjobs={cronjobs} height="800px" />}
        </Box>

        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Cronjobs