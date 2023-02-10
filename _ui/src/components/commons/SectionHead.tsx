import { Box, Typography } from "@mui/material"

type Props = {
    title: string;
}

function SectionHead(props: Props) {
    return <Box mt={2} mb={2} pt={4}>
        <Typography variant="h1" component="h2">{props.title}</Typography>
    </Box>
}


export default SectionHead