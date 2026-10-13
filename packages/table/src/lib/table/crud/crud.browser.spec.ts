// CRUD dialogs in a real browser: CrudObjectView / CrudObjectEdit open native <dialog> elements;
// CrudTableModelFactory opens them for the VIEW / EDIT / CLONE / CREATE actions of the ActionsCellRenderer.
// The REST calls of CrudOptions (fetch) are replaced by spies.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ActionEvent, CrudObjectEdit, CrudObjectView, CrudOptions, CrudTableModelFactory, UrlInfo } from '@guiexpert/table';
import type { TableModelAndOptionsIf, UrlInfoIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame, renderedRows } from '../../../../test-utils/mount-table';

afterEach(() => {
  destroyAllTables();
  document.querySelectorAll('dialog').forEach(d => d.remove());
  vi.restoreAllMocks();
});

const openDialog = (cls: string) => document.querySelector<HTMLDialogElement>(`dialog.${cls}`);
const viewDialog = () => openDialog('ge-table-crud-object-view');
const editDialog = () => openDialog('ge-table-crud-object-edit');
const field = (dialog: HTMLDialogElement, name: string) => dialog.querySelector<HTMLInputElement>(`input[name="${CSS.escape(name)}"]`)!;
const save = () => userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);

/** Would run JavaScript if it became markup – the tests check that no <img> is created. */
const XSS = '<img src="x" onerror="geXss = 1">';

interface Customer { id: number; name: string; age: number; vip: boolean; address: { city: string; zip: string } }

const customer = (): Customer => ({ id: 7, name: 'Ada', age: 36, vip: true, address: { city: 'London', zip: 'N1' } });

describe('CrudObjectView', () => {

  it('opens a modal dialog with one row per property (nested objects flattened)', async () => {
    new CrudObjectView(customer()).openDialog();
    const dialog = viewDialog()!;
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    expect(dialog.querySelector('.ge-table-dialog-header')!.textContent).toBe('Item');
    const rows = Array.from(dialog.querySelectorAll('tbody tr'), tr => Array.from(tr.querySelectorAll('td'), td => td.textContent));
    expect(rows).toEqual([
      ['id', '7'], ['name', 'Ada'], ['age', '36'], ['vip', 'true'],
      ['address', ''], ['address city', 'London'], ['address zip', 'N1'],
    ]);
    expect(dialog.querySelector('td.ge-table-crud-object-view-object-child')!.textContent).toBe('address');
  });

  it('the Close button closes and removes the dialog', async () => {
    new CrudObjectView(customer()).openDialog();
    await userEvent.click(viewDialog()!.querySelector('.ge-table-dialog-footer-close-button')!);
    expect(viewDialog()).toBeNull();
  });

  // Regression: only the Close button removed the element – after Escape the closed <dialog> stayed in the document.
  it('Escape closes and removes the dialog', async () => {
    new CrudObjectView(customer()).openDialog();
    const dialog = viewDialog()!;
    await userEvent.keyboard('{Escape}');
    expect(dialog.open).toBe(false);
    expect(dialog.isConnected).toBe(false);
  });

  // Regression: crud-object-view.ts wrote labels and values unescaped into innerHTML – a value like "<img onerror=…>"
  // became markup (HTML injection with data from the server).
  it('shows a value with markup as text', async () => {
    new CrudObjectView({ id: 1, note: '<b>bold</b>' }).openDialog();
    const dialog = viewDialog()!;
    expect(dialog.querySelector('tbody b')).toBeNull();
    expect(dialog.querySelectorAll('tbody td')[3].textContent).toBe('<b>bold</b>');
  });

  it('shows property names and values with markup as text (no HTML injection)', async () => {
    new CrudObjectView({ [XSS]: XSS, nested: { [XSS]: 1 } }).openDialog();
    const dialog = viewDialog()!;
    expect(dialog.querySelector('img')).toBeNull();
    expect(Array.from(dialog.querySelectorAll('tbody td'), td => td.textContent))
      .toEqual([XSS, XSS, 'nested', '', `nested ${XSS}`, '1']);
  });
});

describe('CrudObjectEdit', () => {

  it('opens a modal form with a typed input per property – without the id', async () => {
    new CrudObjectEdit<Customer>('id', customer(), 'Edit customer').openDialog(() => undefined);
    const dialog = editDialog()!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('.ge-table-dialog-header')!.textContent).toBe('Edit customer');
    expect(dialog.querySelector('input[name="id"]')).toBeNull();
    expect([field(dialog, 'name').type, field(dialog, 'name').value]).toEqual(['text', 'Ada']);
    expect([field(dialog, 'age').type, field(dialog, 'age').value]).toEqual(['number', '36']);
    expect([field(dialog, 'vip').type, field(dialog, 'vip').checked]).toEqual(['checkbox', true]);
    expect(field(dialog, 'address.city').value).toBe('London');
    expect(dialog.querySelector('label[for="address.city"]')!.textContent).toBe('address city');
    expect(dialog.querySelector('fieldset > legend')!.textContent).toBe('address');
    expect(dialog.querySelectorAll('form')).toHaveLength(1);
  });

  it('Save passes the edited copy to onSave and removes the dialog', async () => {
    const original = customer();
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', original).openDialog(onSave);
    const dialog = editDialog()!;
    await userEvent.fill(field(dialog, 'name'), 'Grace');
    await save();
    expect(onSave).toHaveBeenCalledTimes(1);
    const saved: Customer = onSave.mock.calls[0][0];
    expect(saved).toEqual({ ...customer(), name: 'Grace' });
    expect(saved).not.toBe(original);
    expect(original.name).toBe('Ada');
    expect(editDialog()).toBeNull();
  });

  it('Cancel removes the dialog without calling onSave', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'name'), 'Grace');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-cancel-button')!);
    expect(onSave).not.toHaveBeenCalled();
    expect(editDialog()).toBeNull();
  });

  it('Escape removes the dialog without calling onSave', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    const dialog = editDialog()!;
    await userEvent.keyboard('{Escape}');
    expect(dialog.isConnected).toBe(false);
    expect(onSave).not.toHaveBeenCalled();
  });

  // Regression: the copy was shallow ({ ...obj }) – the ORIGINAL nested object was changed as well.
  it('nested values are written back into the copy – the original stays unchanged', async () => {
    const original = customer();
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', original).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'address.city'), 'Paris');
    await save();
    expect(onSave.mock.calls[0][0].address).toEqual({ city: 'Paris', zip: 'N1' });
    expect(original.address.city).toBe('London');
  });

  // Regression: the form was read with FormData – every value came back as string (a number property was saved as
  // "37", a checked checkbox as "on").
  it('Save keeps numbers as numbers', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'age'), '37');
    await save();
    expect(onSave.mock.calls[0][0].age).toBe(37);
    expect(onSave.mock.calls[0][0].vip).toBe(true);
  });

  it('an empty number field saves null', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.clear(field(editDialog()!, 'age'));
    await save();
    expect(onSave.mock.calls[0][0].age).toBeNull();
  });

  // Regression: FormData contains no entry for an unchecked checkbox – unchecking a boolean was not saved (stayed true).
  it('unchecking a boolean saves false', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.click(field(editDialog()!, 'vip'));
    await save();
    expect(onSave.mock.calls[0][0].vip).toBe(false);
  });

  it('null and undefined stay as they are while their field is left empty', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit('id', { id: 1, note: null, phone: undefined, email: null }).openDialog(onSave);
    const dialog = editDialog()!;
    expect([field(dialog, 'note').type, field(dialog, 'note').value]).toEqual(['text', '']);
    await userEvent.fill(field(dialog, 'email'), 'a@b.c');
    await save();
    expect(onSave.mock.calls[0][0]).toEqual({ id: 1, note: null, phone: undefined, email: 'a@b.c' });
  });

  // Regression: a <form> per nested object; the HTML parser dropped the inner <form> tag, its </form> closed the OUTER
  // form → every field after a nested object was outside the form and its changes were lost.
  it('a field after a nested object is saved', async () => {
    const onSave = vi.fn();
    const obj = { id: 1, address: { city: 'London' }, name: 'Ada' };
    new CrudObjectEdit('id', obj).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'name'), 'Grace');
    await save();
    expect(onSave.mock.calls[0][0].name).toBe('Grace');
  });

  // Regression: the value was written unescaped into value="…" – a double quote cut the text.
  it('shows a value with double quotes completely', async () => {
    new CrudObjectEdit('id', { id: 1, name: 'The "Best" Shop' }).openDialog(() => undefined);
    expect(field(editDialog()!, 'name').value).toBe('The "Best" Shop');
  });

  it('title, property names and values with markup are text (no HTML injection)', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit('id', { id: 1, [XSS]: XSS }, XSS).openDialog(onSave);
    const dialog = editDialog()!;
    expect(dialog.querySelector('img')).toBeNull();
    expect(dialog.querySelector('.ge-table-dialog-header')!.textContent).toBe(XSS);
    expect(dialog.querySelector('label')!.textContent).toBe(XSS);
    expect(field(dialog, XSS).value).toBe(XSS);
    await save();
    expect(onSave.mock.calls[0][0]).toEqual({ id: 1, [XSS]: XSS });
  });

  it('a property name with a dot is not split into a nested object', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit('id', { id: 1, 'a.b': 'x', a: { b: 'nested' } }).openDialog(onSave);
    const [flat, nested] = Array.from(editDialog()!.querySelectorAll<HTMLInputElement>('input'));
    await userEvent.fill(flat, 'y');
    await userEvent.fill(nested, 'z');
    await save();
    expect(onSave.mock.calls[0][0]).toEqual({ id: 1, 'a.b': 'y', a: { b: 'z' } });
  });

  it('ignores __proto__ in the data (no prototype pollution)', async () => {
    const onSave = vi.fn();
    const fromServer = JSON.parse('{ "id": 1, "name": "Ada", "__proto__": { "isAdmin": true } }');
    new CrudObjectEdit('id', fromServer).openDialog(onSave);
    expect(Array.from(editDialog()!.querySelectorAll('input'), i => i.name)).toEqual(['name']);
    await save();
    expect(({} as Record<string, unknown>)['isAdmin']).toBeUndefined();
    expect(onSave.mock.calls[0][0].name).toBe('Ada');
  });
});

describe('CrudTableModelFactory – actions open the dialogs', () => {

  interface Item { id: number; name: string; price: number }
  const items: Item[] = [{ id: 1, name: 'Apple', price: 3 }, { id: 2, name: 'Pear', price: 4 }];

  function crudOptions() {
    const options = new CrudOptions();
    const fetchList = vi.fn(() => Promise.resolve(items.map(i => ({ ...i }))));
    const fetchItem = vi.fn((_o: unknown, id: unknown) => Promise.resolve({ ...items.find(i => String(i.id) === String(id))! }));
    const updateItem = vi.fn((): Promise<unknown> => Promise.resolve({}));
    const createItem = vi.fn((): Promise<unknown> => Promise.resolve({}));
    const deleteItem = vi.fn((): Promise<unknown> => Promise.resolve(undefined));
    options.fetchList = fetchList as unknown as CrudOptions['fetchList'];
    options.fetchItem = fetchItem as unknown as CrudOptions['fetchItem'];
    options.updateItem = updateItem;
    options.createItem = createItem;
    options.deleteItem = deleteItem;
    options.getEmptyItem = () => ({ id: null, name: '', price: 0 });
    return { options, fetchList, fetchItem, updateItem, createItem, deleteItem };
  }

  async function createCrudTable(configure?: (spies: ReturnType<typeof crudOptions>) => void) {
    const spies = crudOptions();
    configure?.(spies);
    const factory = new CrudTableModelFactory();
    const mo = await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel<Item>(spies.options, {}, resolve));
    const table = mountTable(mo.tableModel, { tableOptions: mo.tableOptions });
    await nextFrame();
    return { ...table, ...spies, factory };
  }

  const actionLink = (host: HTMLElement, row: number, action: string) =>
    getCellDiv(host, 'body', 'center', row, 3).querySelector<HTMLElement>(`[data-action="${action}"]`)!;
  const nameCell = (host: HTMLElement, row: number) => getCellDiv(host, 'body', 'center', row, 1).textContent!.trim();

  it('renders an Actions column with View / Edit / Clone / Delete links', async () => {
    const { host } = await createCrudTable();
    const cell = getCellDiv(host, 'body', 'center', 1, 3);
    expect(Array.from(cell.querySelectorAll('.ge-table-cell-link'), a => a.textContent!.trim())).toEqual(['View', 'Edit', 'Clone', 'Delete']);
    expect(actionLink(host, 1, 'VIEW').getAttribute('data-id')).toBe('2');
  });

  it('VIEW loads the item and opens the view dialog', async () => {
    const { host, fetchItem } = await createCrudTable();
    const info = vi.spyOn(console, 'info');
    await userEvent.click(actionLink(host, 1, 'VIEW'));
    await vi.waitFor(() => expect(viewDialog()).not.toBeNull());
    expect(fetchItem).toHaveBeenCalledWith(expect.any(CrudOptions), '2');
    expect(viewDialog()!.textContent).toContain('Pear');
    expect(info).not.toHaveBeenCalled(); // the loaded item is no longer logged
  });

  it('EDIT opens "Edit Item" – Save calls updateItem with the id and the edited item, the row shows it', async () => {
    const { host, updateItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 0, 'EDIT'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    expect(editDialog()!.querySelector('.ge-table-dialog-header')!.textContent).toBe('Edit Item');
    await userEvent.fill(field(editDialog()!, 'name'), 'Green apple');
    await userEvent.fill(field(editDialog()!, 'price'), '5');
    await save();
    expect(updateItem).toHaveBeenCalledWith(expect.any(CrudOptions), '1', { id: 1, name: 'Green apple', price: 5 });
    await vi.waitFor(() => expect(nameCell(host, 0)).toBe('Green apple'));
  });

  it('EDIT: an item in the response of updateItem is shown (e.g. values changed by the server)', async () => {
    const { host } = await createCrudTable(({ updateItem }) =>
      updateItem.mockImplementation(() => Promise.resolve({ id: 1, name: 'APPLE (saved)', price: 3 })));
    await userEvent.click(actionLink(host, 0, 'EDIT'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    await save();
    await vi.waitFor(() => expect(nameCell(host, 0)).toBe('APPLE (saved)'));
  });

  it('EDIT: a failed update keeps the row and logs the error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('409');
    const { host } = await createCrudTable(({ updateItem }) => updateItem.mockImplementation(() => Promise.reject(failure)));
    await userEvent.click(actionLink(host, 0, 'EDIT'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    await userEvent.fill(field(editDialog()!, 'name'), 'Green apple');
    await save();
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith('CrudTableModelFactory: EDIT failed', failure));
    expect(nameCell(host, 0)).toBe('Apple');
  });

  // Regression: the clone kept the id of the original (only the field was hidden).
  it('CLONE opens "Clone Item" – Save calls createItem with the edited copy without id', async () => {
    const { host, createItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 1, 'CLONE'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    expect(editDialog()!.querySelector('.ge-table-dialog-header')!.textContent).toBe('Clone Item');
    await userEvent.fill(field(editDialog()!, 'name'), 'Pear 2');
    await save();
    expect(createItem).toHaveBeenCalledWith(expect.any(CrudOptions), { name: 'Pear 2', price: 4 });
  });

  it('CLONE: the created item of the response is added as last row', async () => {
    const { host } = await createCrudTable(({ createItem }) =>
      createItem.mockImplementation(() => Promise.resolve({ id: 3, name: 'Pear 2', price: 4 })));
    await userEvent.click(actionLink(host, 1, 'CLONE'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    await userEvent.fill(field(editDialog()!, 'name'), 'Pear 2');
    await save();
    await vi.waitFor(() => expect(renderedRows(host)).toHaveLength(3));
    expect(nameCell(host, 2)).toBe('Pear 2');
    expect(actionLink(host, 2, 'EDIT').getAttribute('data-id')).toBe('3');
  });

  it('CREATE opens "Create Item" with the fields of getEmptyItem()', async () => {
    const { factory } = await createCrudTable();
    factory.openDialogForCreate();
    const dialog = editDialog()!;
    expect(dialog.querySelector('.ge-table-dialog-header')!.textContent).toBe('Create Item');
    expect(Array.from(dialog.querySelectorAll('input'), i => i.name)).toEqual(['name', 'price']);
  });

  // Regression: crud-table-model-factory.ts passed the untouched empty item to createItem instead of the edited copy –
  // everything typed into the "Create Item" dialog was lost.
  it('CREATE: Save calls createItem with the entered values (without id)', async () => {
    const { factory, createItem } = await createCrudTable();
    factory.openDialogForCreate();
    await userEvent.fill(field(editDialog()!, 'name'), 'Plum');
    await userEvent.fill(field(editDialog()!, 'price'), '2.5');
    await save();
    expect(createItem).toHaveBeenCalledWith(expect.any(CrudOptions), { name: 'Plum', price: 2.5 });
  });

  it('CREATE: without the new item in the response the list is loaded again', async () => {
    const { host, factory, fetchList } = await createCrudTable(({ fetchList }) => {
      fetchList.mockImplementationOnce(() => Promise.resolve(items.map(i => ({ ...i }))))
        .mockImplementationOnce(() => Promise.resolve([...items, { id: 9, name: 'Plum', price: 2 }]));
    });
    factory.openDialogForCreate();
    await userEvent.fill(field(editDialog()!, 'name'), 'Plum');
    await save();
    await vi.waitFor(() => expect(renderedRows(host)).toHaveLength(3));
    expect(fetchList).toHaveBeenCalledTimes(2);
    expect(nameCell(host, 2)).toBe('Plum');
  });

  it('DELETE calls deleteItem and removes the row from the table', async () => {
    const { host, deleteItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 0, 'DELETE'));
    await vi.waitFor(() => expect(renderedRows(host)).toHaveLength(1));
    expect(deleteItem).toHaveBeenCalledWith(expect.any(CrudOptions), '1');
    expect(nameCell(host, 0)).toBe('Pear');
  });

  it('the listener of createTableModel gets every action event first', async () => {
    const spies = crudOptions();
    const listen = vi.fn();
    const factory = new CrudTableModelFactory();
    const mo = await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel<Item>(spies.options, {}, resolve, listen));
    const { host } = mountTable(mo.tableModel, { tableOptions: mo.tableOptions });
    await nextFrame();
    await userEvent.click(actionLink(host, 0, 'VIEW'));
    expect(listen).toHaveBeenCalledWith(expect.any(ActionEvent));
    expect(listen.mock.calls[0][0]).toMatchObject({ action: 'VIEW', rowIndex: 0, id: '1' });
  });
});

describe('CrudOptions – REST calls (fetch)', () => {

  function stubFetch(json: unknown = { ok: true }) {
    return vi.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(new Response(JSON.stringify(json))));
  }

  function options() {
    const o = new CrudOptions();
    o.urls = {
      list: new UrlInfo('GET', '/api/items'),
      read: new UrlInfo('GET', '/api/items/{id}'),
      update: new UrlInfo('PUT', '/api/items/{id}'),
      create: new UrlInfo('POST', '/api/items'),
      delete: new UrlInfo('DELETE', '/api/items/{id}'),
    };
    o.getHeadersInit = () => ({ Authorization: 'Bearer x' });
    return o;
  }

  it('fetchList / fetchItem: GET with the headers, {id} replaced, JSON parsed', async () => {
    const fetch = stubFetch([{ id: 1 }]);
    const o = options();
    await expect(o.fetchList(o)).resolves.toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledWith('/api/items', { headers: { Authorization: 'Bearer x' }, method: 'GET' });
    await o.fetchItem(o, 42);
    expect(fetch).toHaveBeenLastCalledWith('/api/items/42', { headers: { Authorization: 'Bearer x' }, method: 'GET' });
  });

  it('updateItem / createItem send JSON (Content-Type), deleteItem uses its URL and method', async () => {
    const fetch = stubFetch();
    const o = options();
    await o.updateItem(o, 7, { id: 7, name: 'x' });
    let [url, init] = fetch.mock.calls[0];
    expect([url, init?.method, init?.body]).toEqual(['/api/items/7', 'PUT', '{"id":7,"name":"x"}']);
    let headers = new Headers(init?.headers);
    expect([headers.get('Authorization'), headers.get('Content-Type')]).toEqual(['Bearer x', 'application/json']);

    await o.createItem(o, { name: 'y' });
    [url, init] = fetch.mock.calls[1];
    expect([url, init?.method, init?.body]).toEqual(['/api/items', 'POST', '{"name":"y"}']);
    headers = new Headers(init?.headers);
    expect([headers.get('Authorization'), headers.get('Content-Type')]).toEqual(['Bearer x', 'application/json']);

    await o.deleteItem(o, 7);
    expect(fetch).toHaveBeenLastCalledWith('/api/items/7', { headers: { Authorization: 'Bearer x' }, method: 'DELETE' });
  });

  it('a Content-Type of getHeadersInit() is kept', async () => {
    const fetch = stubFetch();
    const o = options();
    o.getHeadersInit = () => ({ 'content-type': 'application/merge-patch+json' });
    await o.updateItem(o, 7, { name: 'x' });
    expect(new Headers(fetch.mock.calls[0][1]?.headers).get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('the id is URL-encoded, every {id} is replaced', async () => {
    const fetch = stubFetch();
    const o = options();
    o.urls.read = new UrlInfo('GET', '/api/{id}/details/{id}');
    await o.fetchItem(o, 'a/b c?');
    expect(fetch.mock.calls[0][0]).toBe('/api/a%2Fb%20c%3F/details/a%2Fb%20c%3F');
  });

  it('the default methods: update PATCH, create POST, delete DELETE', async () => {
    const fetch = stubFetch();
    const o = new CrudOptions();
    const noMethod = (url: string) => ({ url }) as UrlInfoIf;
    o.urls = { list: noMethod('/l'), update: noMethod('/u/{id}'), create: noMethod('/c'), delete: noMethod('/d/{id}') };
    await o.fetchList(o);
    await o.updateItem(o, 1, {});
    await o.createItem(o, {});
    await o.deleteItem(o, 1);
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ['/l', 'GET'], ['/u/1', 'PATCH'], ['/c', 'POST'], ['/d/1', 'DELETE'],
    ]);
  });

  // Regression: a missing URL fetched '' (= the current page) instead of failing.
  it('without a URL the promise is rejected – nothing is fetched', async () => {
    const fetch = stubFetch();
    const o = new CrudOptions();
    await expect(o.fetchList(o)).rejects.toThrow('CrudOptions: no URL for "list" (set urls.list.url)');
    await expect(o.fetchItem(o, 1)).rejects.toThrow('no URL for "read"');
    await expect(o.updateItem(o, 1, {})).rejects.toThrow('no URL for "update"');
    await expect(o.createItem(o, {})).rejects.toThrow('no URL for "create"');
    await expect(o.deleteItem(o, 1)).rejects.toThrow('no URL for "delete"');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('an HTTP error status rejects the promise (the table is not changed)', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response('{"error":"gone"}', { status: 404, statusText: 'Not Found' })));
    const o = options();
    await expect(o.deleteItem(o, 7)).rejects.toThrow('CrudOptions: DELETE /api/items/7 failed: 404 Not Found');
  });

  it('an empty response body (204 No Content) resolves with undefined', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(new Response(null, { status: 204 })));
    const o = options();
    await expect(o.deleteItem(o, 7)).resolves.toBeUndefined();
  });

  // Regression: getIdByObject checked `getIdKey()` but always returned o['id'].
  it('getIdByObject() uses the key of getIdKey()', () => {
    const o = new CrudOptions();
    o.getIdKey = () => 'uuid';
    expect(o.getIdByObject({ uuid: 'u-1', name: 'x' })).toBe('u-1');
    expect(o.getIdByObject({ id: 1 })).toBeUndefined();
  });
});
