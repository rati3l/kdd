import { Event } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";

type Props = {
    events: Array<Event>;
}

function EventDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={props.events} columns={columnDefs().forEvents()} sx={{ height: "300px" }} />
}

export default EventDataGrid