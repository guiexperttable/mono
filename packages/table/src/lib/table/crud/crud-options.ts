import { CrudOptionsIf } from './crud-options.if';
import { UrlsIf } from './urls.if';
import { UrlInfoIf } from './url-info.if';
import { CrudAction } from './crud-action';
import { ColumnWidthsIf } from './column-widths.if';
import { ColumnWidths } from './column-widths';


/**
 * Settings and REST calls of a CRUD table ({@link CrudTableModelFactory}).
 *
 * The default REST calls use `fetch`:
 * - `{id}` in a URL is replaced by the URL-encoded id (`/api/items/{id}` → `/api/items/a%2Fb`);
 * - requests with a body (`updateItem`, `createItem`) send JSON with `Content-Type: application/json`
 *   (unless `getHeadersInit()` already sets a `Content-Type`);
 * - the promise is rejected for an HTTP error status (4xx/5xx) and when no URL is configured;
 *   an empty response body (e.g. `204 No Content`) resolves with `undefined`.
 *
 * Every call can be replaced, e.g. to use your own HTTP client.
 *
 * @example
 * const crudOptions: CrudOptions = {
 *   ...new CrudOptions(),
 *   urls: {
 *     list: new UrlInfo('GET', '/api/customers'),
 *     read: new UrlInfo('GET', '/api/customers/{id}'),
 *     update: new UrlInfo('PUT', '/api/customers/{id}'),
 *     create: new UrlInfo('POST', '/api/customers'),
 *     delete: new UrlInfo('DELETE', '/api/customers/{id}'),
 *   },
 *   getHeadersInit: () => ({ Authorization: 'Bearer my-token' }),
 *   getIdKey: () => 'customerId',
 *   getEmptyItem: () => ({ name: '', vip: false, credit: 0 }),
 * };
 *
 * @category CRUD
 */
export class CrudOptions implements CrudOptionsIf {

  urls: UrlsIf = {
    list: {
      url: '',
      method: 'GET'
    }
  };
  singleRowActions: CrudAction[] = [
    new CrudAction('VIEW', 'View', '', '', 'link'),
    new CrudAction('EDIT', 'Edit', '', '', 'link'),
    new CrudAction('CLONE', 'Clone', '', '', 'link'),
    new CrudAction('DELETE', 'Delete', '', '', 'link'),
    // new CrudAction('CREATE', 'Create', '', '', 'link'),
  ];
  tableActions: CrudAction[] = [
    new CrudAction('CREATE', 'Create', '', '', 'button'),
    new CrudAction('DELETE_SELECTED', 'Delete Selected', '', '', 'button')
  ];
  autoAddActionColumn: boolean = true;
  columnWidths: ColumnWidthsIf = new ColumnWidths();

  calcFixedRightColumnCount: (columnCount: number) => number = (columnCount: number)=> columnCount> 6 ? 1 : 0;

  getHeadersInit: (() => HeadersInit) = () => {
    return {};
  };

  /** The property that holds the id of an item (default `'id'`). */
  getIdKey: () => string= () => 'id';

  /** The id of an item: the value of its `getIdKey()` property (`undefined` if it has none). */
  getIdByObject = <T extends Record<string, unknown>>(o: T) => {
    const idKey = this.getIdKey() ?? 'id';
    return o ? (o as Record<string, any>)[idKey] : undefined;
  };

  fetchList = <T>(crudOptions: CrudOptionsIf): Promise<T[]> =>
    request<T[]>(crudOptions, 'list', 'GET', {});

  fetchItem = <T>(crudOptions: CrudOptionsIf, id: any): Promise<T> =>
    request<T>(crudOptions, 'read', 'GET', { id });

  updateItem = (crudOptions: CrudOptionsIf, id: any, item: any): Promise<any> =>
    request<any>(crudOptions, 'update', 'PATCH', { id, item });

  createItem = (crudOptions: CrudOptionsIf, item: any): Promise<any> =>
    request<any>(crudOptions, 'create', 'POST', { item });

  deleteItem = (crudOptions: CrudOptionsIf, id: any): Promise<any> =>
    request<any>(crudOptions, 'delete', 'DELETE', { id });

  getEmptyItem: () => any = () => {
  };

}


/**
 * One REST call: URL from `crudOptions.urls[key]` (`{id}` replaced by the encoded id), headers from `getHeadersInit()`,
 * an `item` is sent as JSON. Resolves with the parsed JSON response.
 */
function request<T>(
  crudOptions: CrudOptionsIf,
  key: keyof UrlsIf,
  defaultMethod: UrlInfoIf['method'],
  para: { id?: unknown; item?: unknown }
): Promise<T> {
  const urlInfo: UrlInfoIf | undefined = crudOptions.urls?.[key];
  if (!urlInfo?.url) {
    return Promise.reject(new Error(`CrudOptions: no URL for "${key}" (set urls.${key}.url)`));
  }
  const url = 'id' in para
    ? urlInfo.url.split('{id}').join(encodeURIComponent(String(para.id)))
    : urlInfo.url;
  const init: RequestInit = {
    headers: crudOptions.getHeadersInit ? crudOptions.getHeadersInit() : {},
    method: urlInfo.method ?? defaultMethod
  };
  if ('item' in para) {
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    init.headers = headers;
    init.body = JSON.stringify(para.item);
  }
  return fetch(url, init).then(response => readJson<T>(response, init.method!, url));
}

/** The JSON of a response – rejects for an HTTP error status; an empty body gives `undefined`. */
function readJson<T>(response: Response, method: string, url: string): Promise<T> {
  if (!response.ok) {
    return Promise.reject(new Error(`CrudOptions: ${method} ${url} failed: ${response.status} ${response.statusText}`.trim()));
  }
  return response.text().then(text => (text ? JSON.parse(text) : undefined) as T);
}
