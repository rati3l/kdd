import { StatefulSetWorkload } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";
import dataGridTransformers from "./transformers";

type Props = {
    statefulsets: Array<StatefulSetWorkload>;
    height: string;
}

function StatefulSetDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForStatefulsetDataGrid(props.statefulsets)} columns={columnDefs().forStatefulsets()} sx={{ height: props.height }} />
}

export default StatefulSetDataGrid