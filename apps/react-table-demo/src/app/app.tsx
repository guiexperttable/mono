import { ComponentRendererWrapper, GuiexpertTable } from "@guiexpert/react-table";
import { ColumnDefIf, GeMouseEvent, TableFactory } from "@guiexpert/table";
import {
  applyBodyRenderer,
  createColumnDefs,
  createTableOptions,
  createTableRows,
  SimplePersonIf
} from "@guiexpert/demo-table-models";
import { useMemo, useState } from "react";
import GenderRendererComponent from "./GenderRendererComponent";

export function App() {
  const [onlyFemale, setOnlyFemale] = useState(false);
  const [clicks, setClicks] = useState(0);

  // Options and model must be stable (useMemo/useState) – a new object re-creates the table.
  const tableOptions = useMemo(() => createTableOptions(), []);
  const tableModel = useMemo(() => {
    const all: SimplePersonIf[] = createTableRows();
    const rows = onlyFemale ? all.filter(p => p.gender === "Female") : all;
    const columnDefs: ColumnDefIf[] = createColumnDefs();
    applyBodyRenderer(columnDefs[2], new ComponentRendererWrapper(GenderRendererComponent));
    return TableFactory.buildByTypedRowsParam({ rows, columnDefs, tableOptions, fixedLeftColumnCount: 0 });
  }, [onlyFemale, tableOptions]);

  return (
    <>
      <div className="toolbar">
        <button id="toggle" onClick={() => setOnlyFemale(v => !v)}>
          {onlyFemale ? "Show all" : "Only female"}
        </button>
        <span id="clicks"> Clicks: {clicks}</span>
      </div>
      <div className="table-div">
        <GuiexpertTable
          tableModel={tableModel}
          tableOptions={tableOptions}
          mouseClicked={(evt: GeMouseEvent) => { setClicks(c => c + 1); console.info(evt); return {}; }}
        />
      </div>
    </>
  );
}

export default App;
