import { JobWorkload } from "../../clients/response_types";
import StyledDataGrid from "./base/StyledDataGrid";
import columnDefs from "./columndefs";
import dataGridTransformers from "./transformers";

type Props = {
    jobs: Array<JobWorkload>;
    height: string;
}

function JobDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForJobDataGrid(props.jobs)} columns={columnDefs().forJobs()} sx={{ height: props.height }} />
}

export default JobDataGrid