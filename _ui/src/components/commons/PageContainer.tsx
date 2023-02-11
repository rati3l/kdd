import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CssBaseline, Divider, Drawer, FormControl, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, SelectChangeEvent, Toolbar, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import NavListItem from './NavListItem';
import { WORKLOAD_TYPE_CRONJOBS, WORKLOAD_TYPE_DEAEMONSET, WORKLOAD_TYPE_DEPLOYMENTS, WORKLOAD_TYPE_JOBS, WORKLOAD_TYPE_PODS, WORKLOAD_TYPE_STATEFULSETS } from '../../constants';

const drawerWidth = 240;

type Props = {
    refreshIntervalMS: number;
    onRefreshIntervalChanged: any;
    navOpen: boolean;
    onNavOpenChanged: any;
    children: any;
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

function PageContainer(props: Props) {
    const theme = useTheme();

    const handleDrawerOpen = () => {
        props.onNavOpenChanged(true)
    };

    const handleDrawerClose = () => {
        props.onNavOpenChanged(false)
    };

    const onChange = (e: SelectChangeEvent) => {
        e.preventDefault();
        if (props.onRefreshIntervalChanged) {
            props.onRefreshIntervalChanged(parseInt(e.target.value, 10))
        }
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={props.navOpen}>
                <Toolbar variant="dense">
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(props.navOpen && { display: 'none' }) }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" component="div" sx={{ "flexGrow": "1" }}>
                        kdd
                    </Typography>
                    <Box>
                        <FormControl sx={{ m: 1, minWidth: 120, color: "#fff !important" }}>
                            <InputLabel sx={{ color: "#fff !important" }} id="refresh-interval-label">Refresh Interval</InputLabel>
                            <Select sx={{ color: "#fff !important" }} labelId="refresh-interval-label" id="refresh-interval" value={props.refreshIntervalMS.toString()} label="Refresh Interval" onChange={onChange}>
                                <MenuItem value={5000}>5 sec.</MenuItem>
                                <MenuItem value={10000}>10 sec.</MenuItem>
                                <MenuItem value={60000}>1 min.</MenuItem>
                                <MenuItem value={60000 * 5}>5 min.</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
                variant="persistent"
                anchor="left"
                open={props.navOpen}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    <ListItem>
                        <ListItemText disableTypography primary={<Typography variant="body2" style={{ fontWeight: "bold" }}>Cluster</Typography>} />
                    </ListItem>
                    <NavListItem to="/ui" name="Nodes" end={true} />
                    <NavListItem to="/ui/namespaces" name="Namespaces" end={false} />
                    <Divider />
                    <ListItem>
                        <ListItemText disableTypography primary={<Typography variant="body2" style={{ fontWeight: "bold" }}>Workloads</Typography>} />
                    </ListItem>
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_DEPLOYMENTS.toLocaleLowerCase()}`} name="Deployments" end={false} />
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_STATEFULSETS.toLocaleLowerCase()}`} name="Statefulsets" end={false} />
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_DEAEMONSET.toLocaleLowerCase()}`} name="Daemonsets" end={false} />
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_CRONJOBS.toLocaleLowerCase()}`} name="Cronjobs" end={false} />
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_JOBS.toLocaleLowerCase()}`} name="Jobs" end={false} />
                    <NavListItem to={`/ui/workloads/${WORKLOAD_TYPE_PODS.toLocaleLowerCase()}`} name="Pods" end={false} />
                </List>
            </Drawer>
            <Main open={props.navOpen}>
                {props.children}
            </Main>
        </Box>
    );
}

export default PageContainer