---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [rowdrag/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/rowdrag/run.astro).

Model: [createRowDragModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createRowDragModel.ts).

A priority list you sort by hand: grab the grip in the *Task* column and drop the task where it belongs. The table
moves the row in your array (managed mode), scrolls automatically at the top and bottom edge and reports the drop –
save the new order in `onRowDragEnd`. Mouse, touch and pen work the same (Pointer Events); Escape cancels.
MIT-licensed, no dependencies.

```ts title="A drag handle in the title column"
const tableModel = TableFactory.createTableModel({
  rows: tasks,
  rowNumbersVisible: true,                       // "#" = the position
  columnDefs: [
    ColumnDef.create({ property: "title", headerLabel: "Task", rowDrag: task => !task.locked }),
    ColumnDef.create({ property: "owner", headerLabel: "Owner" }),
  ],
});
listener.onRowDragEnd = evt => {
  if (evt.moved) saveOrder(tasks);               // tasks has the new order
};
```

- **Several rows:** select rows (click, Ctrl/⌘-click), then drag one of them – all selected rows move, in their order.
- **Keyboard:** Ctrl+Alt+↑ / ↓ moves the focused task; screen readers hear "Row moved to position 7 of 200".
  The buttons do the same (`tableApi.triggerAction("MOVE_ROW_UP")`) – an alternative without dragging.
- **Sorted or filtered:** the table does not move rows of a sorted or filtered view – the grips are dimmed. With
  `rowDragOptions: { managed: false }` you get the events anyway and decide yourself.
- **Trees:** drop on the upper or lower quarter of a row = sibling, on the middle = child.

Docs: [instructions.md 6.16](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[GeRowDragEvent](/api/classes/GeRowDragEvent.html), [TableApi.moveRows](/api/classes/TableApi.html#moveRows).
