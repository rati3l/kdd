import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import NamespaceDataGrid from "../components/datagrids/NamespaceDataGrid";
import client from "../clients/kdd";
import { Namespace, Workload } from "../clients/response_types";

type Props = {
    refreshIntervalMS: number;
}

function Namespaces(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrrorMessage] = useState<string>("")
    const [workloads, setWorkloads] = useState<Array<Workload>>([])
    const [namespaces, setNamespaces] = useState<Array<Namespace>>([])

    const checkError = (error: any) => {
        if (axios.isAxiosError(error)) {
            console.error("failed to retrieve namespace information", error.message)
            setErrrorMessage("failed to retrieve namespace information")
        } else {
            console.error("a unknown error occurred", error)
            setErrrorMessage("a unknown error occurred")
        }
    }

    const finishLoading = () => {
        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)
        const load = () => {
            Promise.all([client().getNamespaces(), client().getWorkloads()]).then(([namespaces, workloads]) => {
                setNamespaces(namespaces)
                setWorkloads(workloads)
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
        <PageHead title={"Namespaces"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <NamespaceDataGrid workloads={workloads} namespaces={namespaces} />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespaces