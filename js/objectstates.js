import { deepCloneObj } from './utilities.js';
/**
 * Clones all current objects to create a new state
 */
export default class ObjectState {
  constructor(objects) {
    this.objects = [];
    objects.forEach((obj) => {
      const layerObj = deepCloneObj(obj);
      this.objects.push(layerObj);
    });
  }
}
