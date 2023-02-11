import { DeploymentWorkload } from "../../clients/response_types";
import dataGridTransformers from "./transformers";
import StyledDataGrid from "./base/StyledDataGrid";
import workloadColumnDefs from "./columndefs/workload";

type Props = {
    deployments: Array<DeploymentWorkload>;
    height: string;
}

function DeploymentDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return `${row.workload_name}_${row.namespace}` }} rows={dataGridTransformers().transformDataForDeploymentDataGrid(props.deployments)} columns={workloadColumnDefs().forDeployments()} sx={{ height: props.height }} />
}

export default DeploymentDataGrid