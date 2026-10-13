import { escapeHtml } from '../../common/escape-html';

/**
 * Read-only dialog (`<dialog>`) that lists all properties of an object (nested objects flattened). Labels and values
 * are escaped – data is shown as text, never as markup.
 *
 * @category CRUD
 */
export class CrudObjectView<T extends Record<string, any>> {

  private object: T;

  constructor(obj: T) {
    this.object = obj;
  }

  public openDialog(): void {
    const dialog: HTMLDialogElement = document.createElement('dialog');
    dialog.classList.add('ge-table-crud-object-view');
    dialog.innerHTML = `
      <div class="ge-table-dialog-header">Item</div>
      <div class="ge-table-dialog-content">
        ${this.generateHtmlTable(this.object)}
      </div>
      <div class="ge-table-dialog-footer">
        <button class="ge-table-dialog-footer-close-button primary" style="">Close</button>
      </div>
    `;
    document.body.appendChild(dialog);
    // Close button and Escape both close the dialog – remove it from the document then
    dialog.addEventListener('close', () => dialog.remove());
    const closeButton = dialog.querySelector('.ge-table-dialog-footer-close-button') as HTMLButtonElement;
    closeButton.addEventListener('click', () => dialog.close('close'));

    dialog.showModal();
  }

  getCombinedKey(parentKey: string, property: string): string {
    return parentKey ? `${parentKey}.${property}` : property;
  }

  getLabel(combinedKey: string): string {
    return combinedKey.replace(/\./g, ' ');
  }

  private generateHtmlTable(obj: T): string {
    return `<table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${this.generateTableRows(obj)}
      </tbody>
    </table>`;
  }



  private generateTableRows(obj: any, parentKey: string = ''): string {
    const rows:string[] = [];

    const generateRow = (label: string, value: string | null = null, isChildObject: boolean = false): string => `
    <tr>
      <td${isChildObject ? ' class="ge-table-crud-object-view-object-child"' : ''}>${escapeHtml(label)}</td>
      <td>${escapeHtml(value)}</td>
    </tr>`;

    for (const property in obj) {
      if (!obj.hasOwnProperty(property)) continue;

      const propertyValue = obj[property];
      const combinedKey = this.getCombinedKey(parentKey, property);
      const label = this.getLabel(combinedKey);

      if (typeof propertyValue === 'object' && propertyValue !== null) {
        rows.push( generateRow(label, null, true));
        rows.push( this.generateTableRows(propertyValue, combinedKey));
      } else {
        rows.push( generateRow(label, String(propertyValue)));
      }
    }

    return rows.join('');
  }



}