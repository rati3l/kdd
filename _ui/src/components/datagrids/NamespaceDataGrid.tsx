import StyledDataGrid from "./base/StyledDataGrid";
import dataGridTransformers from "./transformers";
import { Namespace, Workload } from "../../clients/response_types";
import columnDefs from "./columndefs";

type Props = {
    workloads: Array<Workload>;
    namespaces: Array<Namespace>;
}

function NamespaceDataGrid(props: Props) {
    const workloads: Array<Workload> = props.workloads
    const namespaces: Array<Namespace> = props.namespaces

    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={dataGridTransformers().transformDataForNamespaceDataGrid(namespaces, workloads)} columns={columnDefs().forNamespaces()} sx={{ height: "800px" }} />
}

export default NamespaceDataGrid