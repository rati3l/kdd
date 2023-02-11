import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import NodesDataGrid from "../components/datagrids/NodesDataGrid";
import { Node } from "../clients/response_types";
import client from "../clients/kdd";

type Props = {
    refreshIntervalMS: number;
}

function Nodes(props: Props) {
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [nodes, setNodes] = useState<Array<Node>>([])

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
            client().getNodes().then((nodes: Array<Node>) => {
                setNodes(nodes)
            })
                .catch(checkError)
                .finally(
                    finishLoading
                )
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
        <PageHead title={"Nodes"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <NodesDataGrid nodes={nodes} />}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Nodes