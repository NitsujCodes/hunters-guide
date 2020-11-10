import baseClass from './baseClass.obj.js';

export default class Tactic extends baseClass
{
    #key;
    #data = {};

    constructor(key, data)
    {
        super();

        this.#key = key;
    }
}