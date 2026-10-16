[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DetailRendererIf

# Interface: DetailRendererIf\<T\>

Renders the content of a detail row – the object form of [DetailRenderFnType](../modules.md#detailrenderfntype), e.g. the
`DetailComponentRendererWrapper` of the framework wrappers (React, Vue, Svelte …).

The content is created once, when the detail row becomes visible for the first time, and lives until the row is
collapsed – scrolling only hides and shows it (inputs, selections and scroll positions stay).

**`Example`**

```ts
class OrderNotesRenderer implements DetailRendererIf<Order> {
  render(container: HTMLDivElement, order: Order): () => void {
    const textarea = document.createElement("textarea");
    textarea.value = order.notes ?? "";
    container.appendChild(textarea);
    return () => { order.notes = textarea.value; };   // cleanup: keep the text
  }
}
```

**`Since`**

1.1.97

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Methods

- [render](DetailRendererIf.md#render)

## Methods

### render

▸ **render**(`container`, `row`, `context`): `void` \| () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLDivElement` |
| `row` | `T` |
| `context` | [`DetailRenderContextIf`](DetailRenderContextIf.md)\<`T`\> |

#### Returns

`void` \| () => `void`

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L103)
