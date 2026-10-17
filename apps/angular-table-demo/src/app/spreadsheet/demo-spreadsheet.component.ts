import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { FormulaBar, GeUndoEvent, SpreadsheetFactory, TableApi } from "@guiexpert/table";
import { createSpreadsheetQuoteData } from "@guiexpert/demo-table-models";

/**
 * Spreadsheet mode (since @guiexpert/table 1.1.99): one call builds column letters, row numbers, cell formulas with A1
 * references, copy & paste with Excel and undo/redo. The formula bar is plain DOM (FormulaBar) above the table.
 */
@Component({
  selector: "demo-spreadsheet",
  templateUrl: "./demo-spreadsheet.component.html",
  styleUrls: ["./demo-spreadsheet.component.css"],
})
export class DemoSpreadsheetComponent implements OnDestroy {

  @ViewChild("formulaBar", { static: true }) formulaBarHost!: ElementRef<HTMLDivElement>;

  readonly sheet = SpreadsheetFactory.create({ data: createSpreadsheetQuoteData(), rowCount: 200, columnWidth: 130 });
  canUndo = false;
  canRedo = false;

  private tableApi?: TableApi;
  private formulaBar?: FormulaBar;

  constructor(private readonly cdr: ChangeDetectorRef) {
  }

  /** The table runs outside Angular's zone – the undo/redo buttons are updated here. */
  onUndoStackChanged(evt: GeUndoEvent): void {
    this.canUndo = evt.canUndo;
    this.canRedo = evt.canRedo;
    this.cdr.detectChanges();
  }

  onTableReady(api: TableApi): void {
    this.tableApi = api;
    this.formulaBar = new FormulaBar(this.formulaBarHost.nativeElement, api);
  }

  undo(): void {
    this.tableApi?.undo();
  }

  redo(): void {
    this.tableApi?.redo();
  }

  insertRow(): void {
    const api = this.tableApi;
    const cell = api?.getActiveCell();
    if (!api || !cell) return;
    const address = api.getCellAddress(cell[0], Math.max(cell[1], 1)) ?? "A1"; // "C5" – also when sorted
    api.insertRows(Number(address.replace(/^[A-Z]+/, "")) - 1, 1);           // formulas below follow
  }

  downloadExcel(): void {
    this.tableApi?.downloadExcel("quote.xlsx", "", { cellFormulas: true });   // real formulas
  }

  ngOnDestroy(): void {
    this.formulaBar?.destroy();
  }
}
