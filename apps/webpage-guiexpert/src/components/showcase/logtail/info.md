---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [logtail/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/logtail/run.astro).

Model and live logic: [createLogTailModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/log-tail/createLogTailModel.ts),
[log-tail-controller.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/log-tail/log-tail-controller.ts).

A rolling log file like `tail -f`: up to 5,000 new lines per second, one million lines at most. Select a line, press
↓ or Shift+↓ – the selection stays at its line while the lines keep coming, and every click arrives, even while the
table renders under the mouse pointer. MIT-licensed, no dependencies.

```ts title="Append the lines of an animation frame"
const result = tableApi.appendRows(lines, {
  follow: frozen ? false : "auto",   // "auto": at the end → stay at the end ("tail -f")
  maxRows: 1_000_000                 // ring buffer: the oldest lines leave
});
if (result && !result.following) newBelow += result.shown;   // "+N new lines"
```

- **Freeze scroll:** `follow: false` – the view stays where it is, even at the end; lines keep coming.
- **Scroll to end:** `tableApi.repaintHard({ py: Number.MAX_SAFE_INTEGER })` and `follow: "auto"` again – it follows
  also when you scroll to the end yourself.
- **Pause intake:** the app collects the lines and appends them as one block later – one call, one render.
- **Cost:** O(k) for k new lines (in place, no copy); a filter runs only for the new lines, a sort order merges them in.
  If only lines below the visible ones come in, no cell is rebuilt.
- **Own data structure:** `tableApi.rowsAppended(count, { removedAtStart })` after your area model appended.

Docs: [instructions.md 6.9](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[TableApi.appendRows](/api/classes/TableApi.html#appendRows), [TableApi.rowsAppended](/api/classes/TableApi.html#rowsAppended).
