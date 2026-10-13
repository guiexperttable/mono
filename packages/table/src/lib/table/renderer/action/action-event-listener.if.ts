import { ActionEventIf } from './action-event.if';

/** @category Renderers & editing */
export interface ActionEventListenerIf{


  onActionEvent(actionEvent: ActionEventIf): void;

}