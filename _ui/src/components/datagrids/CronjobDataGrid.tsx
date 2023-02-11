import { CronjobWorkload } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";
import dataGridTransformers from "./transformers";

type Props = {
    cronjobs: Array<CronjobWorkload>;
    height: string;
}

function CronjobDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForCronjobDataGrid(props.cronjobs)} columns={columnDefs().forCronjobs()} sx={{ height: props.height }} />
}

export default CronjobDataGrid