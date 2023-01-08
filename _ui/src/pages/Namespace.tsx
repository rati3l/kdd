import React, { useEffect, useState } from "react"
import PageHead from "../components/PageHead"
import { Box } from "@mui/system";
import { Alert,  CircularProgress, Snackbar } from "@mui/material";
import { useParams } from "react-router-dom";

type Props = {
    refreshIntervalMS: number;
}

function Namespace(props: Props) {
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrrorMessage] = useState("")
    const [data, setData] = useState([])

    const params = useParams()

    let interval: any = null

    useEffect(() => {
        setLoading(true)

        const fetchFunc = () => {
        }

        // fetching data initially
        fetchFunc()
        // check if already a interval is configured
        if (interval) {
            clearInterval(interval)
        }
        // configure new interval
        interval = setInterval(fetchFunc, props.refreshIntervalMS)
        return () => {
            clearInterval(interval)
        }

    }, [props.refreshIntervalMS]);



    return <React.Fragment>
        <PageHead title={`Namespace ${params.name}`} />
        <Box>
            {loading ? <CircularProgress color="primary" /> : <Box></Box>}
        </Box>
        <Snackbar anchorOrigin={{ horizontal: "left", vertical: "bottom" }} open={errorMessage != ""} autoHideDuration={6000}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
    </React.Fragment>
}

export default Namespace