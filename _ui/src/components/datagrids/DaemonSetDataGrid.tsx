import StyledDataGrid from "./base/StyledDataGrid";
import { DaemonSetWorkload } from "../../clients/response_types";
import dataGridTransformers from "./transformers";
import columnDefs from "./columndefs";

type Props = {
    daemonsets: Array<DaemonSetWorkload>;
    height: string;
}

function DaemonSetDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForDaemonsetDataGrid(props.daemonsets)} columns={columnDefs().forDeamonsets()} sx={{ height: props.height }} />
}

export default DaemonSetDataGrid