import { PodWorkload } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";
import dataGridTransformers from "./transformers";

type Props = {
    pods: Array<PodWorkload>;
    height: string;
}

function PodsDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForPodDataGrid(props.pods)} columns={columnDefs().forPods()} sx={{ height: props.height }} />
}

export default PodsDataGrid