import React, { useEffect, useState } from "react"
import PageHead from "../components/commons/PageHead"
import axios from "axios";
import { Box } from "@mui/system";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import NodesDataGrid from "../components/datagrids/NodesDataGrid";

type Props = {
    refreshIntervalMS: number;
}

function Nodes(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState([])

    useEffect(() => {
        setLoading(true)

        const fetchFunc = () => {
            const getNodes = async () => {
                const { data } = await axios.get(`/api/v1/nodes`, { headers: { Accept: "application/json" } })
                return data.data
            }

            getNodes().then(data => {
                setData(data)
            }).catch((error) => {
                if (axios.isAxiosError(error)) {
                    console.error("failed to retrieve nodes information", error.message)
                    setErrorMessage("failed to retrieve nodes information")
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
        <PageHead title={"Nodes"} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <NodesDataGrid rows={data}/>}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage !== ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Nodes