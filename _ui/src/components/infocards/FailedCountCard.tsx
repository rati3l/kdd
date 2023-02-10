import { Box, Card, CardContent, Typography } from "@mui/material"

type Props = {
    headline: string;
    failed: number;
    total: number;
}

function FailedCountCard(props: Props) {
    return <Card>
        <CardContent>
            <Typography variant="h5" mb={2} align="center">
                {props.headline}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h1" color="error" component="span">
                    {props.failed}
                </Typography>
                <Typography variant="h1" color="text.secondary" component="span">
                    /{props.total}
                </Typography>
            </Box>
        </CardContent>
    </Card>
}

export default FailedCountCard