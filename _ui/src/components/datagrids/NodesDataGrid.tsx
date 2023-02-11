import StyledDataGrid from "./base/StyledDataGrid";
import { Node } from "../../clients/response_types";
import dataGridTransformers from "./transformers";
import columnDefs from "./columndefs";

type Props = {
    nodes: Array<Node>;
}

function NodesDataGrid(props: Props) {
    return <StyledDataGrid disableSelectionOnClick={true} getRowId={(row: any) => { return row.name }} rows={dataGridTransformers().transformDataForNodeDataGrid(props.nodes)} columns={columnDefs().forNodes()} sx={{ height: "800px" }} />
}

export default NodesDataGrid