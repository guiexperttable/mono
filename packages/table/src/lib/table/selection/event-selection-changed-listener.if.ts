import { SelectionModelIf } from './selection-model.if';


/** @category Events */
export interface EventSelectionChangedListenerIf {

  onSelectionChanged(model: SelectionModelIf): void;

}
