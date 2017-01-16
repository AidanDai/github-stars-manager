import {
  submitEventListener,
  keyupEventListener,
  clickEventListener,
  hashChangeEventListener,
} from './eventListeners';
import {addHeaderTagMenu} from './uiTagPage';
import {insertModalStructure} from './uiModal';

/**
 *
 */
export function initDOM() {
  insertModalStructure();
  addHeaderTagMenu();
  submitEventListener();
  keyupEventListener();
  clickEventListener();
  hashChangeEventListener();
}
