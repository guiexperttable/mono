import { escapeHtml } from '../../common/escape-html';

/** Property names that must never be written via a form field name (prototype pollution). */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Edit dialog (`<dialog>` with one form) for an object: one input per property, nested objects flattened
 * (`address.city`), the id property (`idKey`) is not editable.
 *
 * - Works on a deep copy – the object passed in is not changed.
 * - Values keep their type: numbers stay numbers (an empty number field becomes `null`), booleans are checkboxes
 *   (unchecking saves `false`), `null`/`undefined` stay as they are while their text field is left empty.
 * - Labels and values are escaped – data is shown as text, never as markup.
 * - Save calls `onSave(editedCopy)`; Save, Cancel and Escape close and remove the dialog.
 *
 * @example
 * new CrudObjectEdit('id', { id: 7, name: 'Ada', age: 36, vip: true }, 'Edit customer')
 *   .openDialog(updated => console.info(updated)); // { id: 7, name: '…', age: 37, vip: false }
 *
 * @category CRUD
 */
export class CrudObjectEdit<T extends Record<string, any>> {

  /** Writing direction of the dialog (`dir`) – the CRUD factory sets the direction of the table. @since 1.1.98 */
  direction?: "ltr" | "rtl";


  private object: T;
  /** Property path of every input (index = `data-field-index`) – a key may contain a dot itself. */
  private fieldPaths: string[][] = [];

  constructor(
    private idKey: keyof T,
    obj: T,
    public dialogTitle: string = 'Edit Item'
  ) {
    this.object = CrudObjectEdit.deepCopy(obj);
  }

  public openDialog(onSave: (updatedObject: T) => void): void {
    const dialog: HTMLDialogElement = document.createElement('dialog');
    dialog.classList.add('ge-table-crud-object-edit');
    if (this.direction) {
      dialog.setAttribute('dir', this.direction); // outside the host: the direction of the table (since 1.1.98)
    }
    this.fieldPaths = [];
    dialog.innerHTML = `
      <div class="ge-table-dialog-header">${escapeHtml(this.dialogTitle)}</div>
      <div class="ge-table-dialog-content">
        <form>${this.generateFields(this.object)}</form>
      </div>
      <div class="ge-table-dialog-footer">
        <button class="ge-table-dialog-footer-save-button primary">Save</button>
        <button class="ge-table-dialog-footer-cancel-button">Cancel</button>
      </div>
    `;
    document.body.appendChild(dialog);
    // Save, Cancel and Escape close the dialog – remove it from the document then
    dialog.addEventListener('close', () => dialog.remove());

    const form = dialog.querySelector('form') as HTMLFormElement;
    form.addEventListener('submit', evt => evt.preventDefault()); // Enter in a field must not reload the page

    const saveButton = dialog.querySelector('.ge-table-dialog-footer-save-button') as HTMLButtonElement;
    const cancelButton = dialog.querySelector('.ge-table-dialog-footer-cancel-button') as HTMLButtonElement;

    saveButton.addEventListener('click', () => {
      form.querySelectorAll<HTMLInputElement>('input[data-field-index]').forEach(input => {
        const path = this.fieldPaths[Number(input.dataset['fieldIndex'])];
        if (path) {
          const oldValue = this.getNestedValue(this.object, path);
          this.setNestedValue(this.object, path, this.readInput(input, oldValue));
        }
      });
      onSave(this.object);
      dialog.close('save');
    });

    cancelButton.addEventListener('click', () => dialog.close('cancel'));

    dialog.showModal();
  }

  /** The input fields for all properties of `obj` (recursive for nested objects – no nested `<form>`). */
  private generateFields(obj: any, parentPath: string[] = []): string {
    const fields: string[] = [];
    for (const property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property) || this.idKey === property
        || FORBIDDEN_KEYS.has(property)) {
        continue;
      }

      const path = [...parentPath, property];
      const label = path.join(' '); // address.city → "address city"
      const value = obj[property];

      if (typeof value === 'object' && value !== null) {
        fields.push(`<fieldset class="form-group"><legend>${escapeHtml(label)}</legend>${this.generateFields(value, path)}</fieldset>`);
        continue;
      }

      const name = escapeHtml(path.join('.'));
      const attributes = `id="${name}" name="${name}" data-field-index="${this.fieldPaths.push(path) - 1}"`;
      let inputField: string;
      if (typeof value === 'number') {
        inputField = `<input type="number" step="any" ${attributes} value="${escapeHtml(value)}" />`;
      } else if (typeof value === 'boolean') {
        inputField = `<input type="checkbox" ${attributes} ${value ? 'checked' : ''} />`;
      } else {
        // strings and everything else; null/undefined → empty field
        inputField = `<input type="text" ${attributes} value="${escapeHtml(value)}" />`;
      }

      fields.push(`
        <div class="form-field">
          <label for="${name}">${escapeHtml(label)}</label>
          ${inputField}
        </div>
      `);
    }
    return fields.join('');
  }

  /** The value of an input, in the type of the original value. */
  private readInput(input: HTMLInputElement, oldValue: unknown): unknown {
    if (input.type === 'checkbox') {
      return input.checked;
    }
    if (input.type === 'number') {
      return input.value === '' ? null : Number(input.value);
    }
    if ((oldValue === null || oldValue === undefined) && input.value === '') {
      return oldValue; // an empty field for an empty value: keep null/undefined
    }
    return input.value;
  }

  private getNestedValue(obj: any, path: string[]): unknown {
    let current = obj;
    for (const key of path) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }

  private setNestedValue(obj: any, keys: string[], value: any): void {
    if (keys.some(key => FORBIDDEN_KEYS.has(key))) {
      return; // never write into a prototype
    }
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!;
      if (current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]!] = value;
  }

  /** A deep copy (structuredClone; JSON as fallback for objects that cannot be cloned, e.g. with functions). */
  private static deepCopy<O>(obj: O): O {
    try {
      return structuredClone(obj);
    } catch {
      return JSON.parse(JSON.stringify(obj));
    }
  }
}
