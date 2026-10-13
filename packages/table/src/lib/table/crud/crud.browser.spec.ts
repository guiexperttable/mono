// CRUD dialogs in a real browser: CrudObjectView / CrudObjectEdit open native <dialog> elements;
// CrudTableModelFactory opens them for the VIEW / EDIT / CLONE / CREATE actions of the ActionsCellRenderer.
// The REST calls of CrudOptions (fetch) are replaced by spies.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ActionEvent, CrudObjectEdit, CrudObjectView, CrudOptions, CrudTableModelFactory, UrlInfo } from '@guiexpert/table';
import type { TableModelAndOptionsIf } from '@guiexpert/table';
import { destroyAllTables, getCellDiv, mountTable, nextFrame } from '../../../../test-utils/mount-table';

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => undefined); // the factory logs every loaded item
});

afterEach(() => {
  destroyAllTables();
  document.querySelectorAll('dialog').forEach(d => d.remove());
  vi.restoreAllMocks();
});

const openDialog = (cls: string) => document.querySelector<HTMLDialogElement>(`dialog.${cls}`);
const viewDialog = () => openDialog('ge-table-crud-object-view');
const editDialog = () => openDialog('ge-table-crud-object-edit');
const field = (dialog: HTMLDialogElement, name: string) => dialog.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

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

  it('Escape closes the dialog', async () => {
    new CrudObjectView(customer()).openDialog();
    const dialog = viewDialog()!;
    await userEvent.keyboard('{Escape}');
    expect(dialog.open).toBe(false);
    // NOTE: only the Close button removes the element – after Escape the closed <dialog> stays in the document.
    expect(dialog.isConnected).toBe(true);
  });

  // BUG: crud-object-view.ts:77 writes labels and values unescaped into innerHTML – a value like "<img onerror=…>"
  // becomes markup (HTML injection with data from the server).
  it.fails('shows a value with markup as text', async () => {
    new CrudObjectView({ id: 1, note: '<b>bold</b>' }).openDialog();
    const dialog = viewDialog()!;
    expect(dialog.querySelector('tbody b')).toBeNull();
    expect(dialog.querySelectorAll('tbody td')[3].textContent).toBe('<b>bold</b>');
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
  });

  it('Save passes the edited copy to onSave and removes the dialog', async () => {
    const original = customer();
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', original).openDialog(onSave);
    const dialog = editDialog()!;
    await userEvent.fill(field(dialog, 'name'), 'Grace');
    await userEvent.click(dialog.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(onSave).toHaveBeenCalledTimes(1);
    const saved: Customer = onSave.mock.calls[0][0];
    expect(saved.name).toBe('Grace');
    expect(saved.id).toBe(7);
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

  it('nested values are written back into the nested object', async () => {
    const original = customer();
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', original).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'address.city'), 'Paris');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(onSave.mock.calls[0][0].address.city).toBe('Paris');
    // NOTE: the copy is shallow ({ ...obj }) – the ORIGINAL nested object is changed as well.
    expect(original.address.city).toBe('Paris');
  });

  // BUG: crud-object-edit.ts:41 reads the form with FormData – every value comes back as string: a number property
  // is saved as "37" (and a checked checkbox as "on").
  it.fails('Save keeps numbers as numbers', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'age'), '37');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(onSave.mock.calls[0][0].age).toBe(37);
  });

  // BUG: FormData contains no entry for an unchecked checkbox – unchecking a boolean is not saved (stays true).
  it.fails('unchecking a boolean saves false', async () => {
    const onSave = vi.fn();
    new CrudObjectEdit<Customer>('id', customer()).openDialog(onSave);
    await userEvent.click(field(editDialog()!, 'vip'));
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(onSave.mock.calls[0][0].vip).toBe(false);
  });

  // BUG: crud-object-edit.ts:75 nests a <form> per nested object; the HTML parser drops the inner <form> tag, its
  // </form> closes the OUTER form → every field after a nested object is outside the form and its changes are lost.
  it.fails('a field after a nested object is saved', async () => {
    const onSave = vi.fn();
    const obj = { id: 1, address: { city: 'London' }, name: 'Ada' };
    new CrudObjectEdit('id', obj).openDialog(onSave);
    await userEvent.fill(field(editDialog()!, 'name'), 'Grace');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(onSave.mock.calls[0][0].name).toBe('Grace');
  });

  // BUG: crud-object-edit.ts:85 writes the value unescaped into value="…" – a double quote cuts the text.
  it.fails('shows a value with double quotes completely', async () => {
    new CrudObjectEdit('id', { id: 1, name: 'The "Best" Shop' }).openDialog(() => undefined);
    expect(field(editDialog()!, 'name').value).toBe('The "Best" Shop');
  });
});

describe('CrudTableModelFactory – actions open the dialogs', () => {

  interface Item { id: number; name: string; price: number }
  const items: Item[] = [{ id: 1, name: 'Apple', price: 3 }, { id: 2, name: 'Pear', price: 4 }];

  function crudOptions() {
    const options = new CrudOptions();
    options.fetchList = (() => Promise.resolve(items.map(i => ({ ...i })))) as CrudOptions['fetchList'];
    const fetchItem = vi.fn((_o: unknown, id: unknown) => Promise.resolve({ ...items.find(i => String(i.id) === String(id))! }));
    const updateItem = vi.fn(() => Promise.resolve({}));
    const createItem = vi.fn(() => Promise.resolve({}));
    options.fetchItem = fetchItem as unknown as CrudOptions['fetchItem'];
    options.updateItem = updateItem;
    options.createItem = createItem;
    options.getEmptyItem = () => ({ name: '', price: 0 });
    return { options, fetchItem, updateItem, createItem };
  }

  async function createCrudTable() {
    const spies = crudOptions();
    const factory = new CrudTableModelFactory();
    const mo = await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel<Item>(spies.options, {}, resolve));
    const table = mountTable(mo.tableModel, { tableOptions: mo.tableOptions });
    await nextFrame();
    return { ...table, ...spies, factory };
  }

  const actionLink = (host: HTMLElement, row: number, action: string) =>
    getCellDiv(host, 'body', 'center', row, 3).querySelector<HTMLElement>(`[data-action="${action}"]`)!;

  it('renders an Actions column with View / Edit / Clone / Delete links', async () => {
    const { host } = await createCrudTable();
    const cell = getCellDiv(host, 'body', 'center', 1, 3);
    expect(Array.from(cell.querySelectorAll('.ge-table-cell-link'), a => a.textContent!.trim())).toEqual(['View', 'Edit', 'Clone', 'Delete']);
    expect(actionLink(host, 1, 'VIEW').getAttribute('data-id')).toBe('2');
  });

  it('VIEW loads the item and opens the view dialog', async () => {
    const { host, fetchItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 1, 'VIEW'));
    await vi.waitFor(() => expect(viewDialog()).not.toBeNull());
    expect(fetchItem).toHaveBeenCalledWith(expect.any(CrudOptions), '2');
    expect(viewDialog()!.textContent).toContain('Pear');
  });

  it('EDIT opens "Edit Item" – Save calls updateItem with the id and the edited item', async () => {
    const { host, updateItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 0, 'EDIT'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    expect(editDialog()!.querySelector('.ge-table-dialog-header')!.textContent).toBe('Edit Item');
    await userEvent.fill(field(editDialog()!, 'name'), 'Green apple');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(updateItem).toHaveBeenCalledWith(expect.any(CrudOptions), '1', expect.objectContaining({ id: 1, name: 'Green apple' }));
  });

  it('CLONE opens "Clone Item" – Save calls createItem with the edited copy', async () => {
    const { host, createItem } = await createCrudTable();
    await userEvent.click(actionLink(host, 1, 'CLONE'));
    await vi.waitFor(() => expect(editDialog()).not.toBeNull());
    expect(editDialog()!.querySelector('.ge-table-dialog-header')!.textContent).toBe('Clone Item');
    await userEvent.fill(field(editDialog()!, 'name'), 'Pear 2');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    // NOTE: the clone keeps the id of the original (only the field is hidden) – the server has to ignore it.
    expect(createItem).toHaveBeenCalledWith(expect.any(CrudOptions), expect.objectContaining({ id: 2, name: 'Pear 2' }));
  });

  it('CREATE opens "Create Item" with the fields of getEmptyItem()', async () => {
    const { factory } = await createCrudTable();
    factory.openDialogForCreate();
    const dialog = editDialog()!;
    expect(dialog.querySelector('.ge-table-dialog-header')!.textContent).toBe('Create Item');
    expect(Array.from(dialog.querySelectorAll('input'), i => i.name)).toEqual(['name', 'price']);
  });

  // BUG: crud-table-model-factory.ts:177 passes the untouched empty item (`clone`) to createItem instead of the
  // `updatedObject` of the dialog – everything typed into the "Create Item" dialog is lost.
  it.fails('CREATE: Save calls createItem with the entered values', async () => {
    const { factory, createItem } = await createCrudTable();
    factory.openDialogForCreate();
    await userEvent.fill(field(editDialog()!, 'name'), 'Plum');
    await userEvent.click(editDialog()!.querySelector('.ge-table-dialog-footer-save-button')!);
    expect(createItem).toHaveBeenCalledWith(expect.any(CrudOptions), expect.objectContaining({ name: 'Plum' }));
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

  it('updateItem / createItem / deleteItem use their URL, method and a JSON body', async () => {
    const fetch = stubFetch();
    const o = options();
    await o.updateItem(o, 7, { id: 7, name: 'x' });
    expect(fetch).toHaveBeenLastCalledWith('/api/items/7', { headers: { Authorization: 'Bearer x' }, method: 'PUT', body: '{"id":7,"name":"x"}' });
    await o.createItem(o, { name: 'y' });
    expect(fetch).toHaveBeenLastCalledWith('/api/items', { headers: { Authorization: 'Bearer x' }, method: 'POST', body: '{"name":"y"}' });
    await o.deleteItem(o, 7);
    expect(fetch).toHaveBeenLastCalledWith('/api/items/7', { headers: { Authorization: 'Bearer x' }, method: 'DELETE' });
  });

  it('without URLs: empty URL and the default methods', async () => {
    const fetch = stubFetch();
    const o = new CrudOptions();
    await o.updateItem(o, 1, {});
    expect(fetch.mock.calls[0][0]).toBe('');
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'PATCH' });
    await o.createItem(o, {});
    expect(fetch.mock.calls[1][1]).toMatchObject({ method: 'POST' });
    await o.deleteItem(o, 1);
    // NOTE: crud-options.ts – the default method of deleteItem is GET (not DELETE), and a missing URL fetches ''
    // (= the current page) instead of failing.
    expect(fetch.mock.calls[2]).toEqual(['', { headers: {}, method: 'GET' }]);
  });

  // BUG: crud-options.ts getIdByObject checks `getIdKey()` but always returns o['id'].
  it.fails('getIdByObject() uses the key of getIdKey()', () => {
    const o = new CrudOptions();
    o.getIdKey = () => 'uuid';
    expect(o.getIdByObject({ uuid: 'u-1', name: 'x' })).toBe('u-1');
  });
});
