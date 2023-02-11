import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import StatefulSeteDataGrid from "../components/datagrids/StatefulSetDataGrid";
import { StatefulSetWorkload } from "../clients/response_types";
import client from "../clients/kdd";

type Props = {
    refreshIntervalMS: number;
}

function StatefulSets(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [statefulsets, setStatefulsets] = useState<Array<StatefulSetWorkload>>([])

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
            client().getStatefulsets().then((statefulsets: Array<StatefulSetWorkload>) => {
                setStatefulsets(statefulsets)
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
        <PageHead title={"Workloads - StatefulSets"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <StatefulSeteDataGrid statefulsets={statefulsets} height="800px" />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default StatefulSets