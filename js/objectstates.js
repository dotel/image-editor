import LayerObject from './layerobject.js';
import {deepCloneObj} from './utilities.js' 
export default class ObjectState{
    constructor(objects){
        this.objects = [];
        objects.forEach(obj => {
            let layerObj = deepCloneObj(obj)
            this.objects.push(layerObj)
        })
    }
}