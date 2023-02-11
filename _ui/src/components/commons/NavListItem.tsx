import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useMatch, useResolvedPath } from "react-router-dom";
import LinkBehavior from "./LinkBehavior";

type Props = {
    to: string;
    name: string;
    end: boolean;
};

function NavListItem(props: Props) {
    let resolved = useResolvedPath(props.to);
    let match = useMatch({ path: resolved.pathname, end: props.end });

    const selected : boolean = match !== null
    return (
        <ListItem disablePadding>
            <ListItemButton href={props.to} component={LinkBehavior} selected={selected}>
                <ListItemText primary={props.name} />
            </ListItemButton>
        </ListItem>
    )
}

export default NavListItem;