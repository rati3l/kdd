import { Workload } from "../../clients/response_types";
import dataGridTransformers from "./transformers";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";

type Props = {
    workloadType: string;
    workloads: Array<Workload>;
    height: string;
}

function WorkloadDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForWorkloadType(props.workloadType, props.workloads)} columns={columnDefs().byWorkloadType(props.workloadType)} sx={{ height: props.height }} />
}

export default WorkloadDataGrid