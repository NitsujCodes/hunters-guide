import baseClass from './baseClass.obj.js';

export default class Evidence extends baseClass
{
    #key;
    #data = new Map();

    constructor(key, data)
    {
        super();

        this.#key = key;

        this.#data.set('name', data.name);
        this.#data.set('badgeClass', data.badgeClass);
        this.#data.set('iconClass', data.iconClass);
    }

    get key()
    {
        return this.#key;
    }

    set badgeClass(badgeClass)
    {
        this.#data.set('badgeClass', badgeClass);
        return this;
    }

    get badgeClass()
    {
        return this.#data.get('badgeClass');
    }

    set iconClass(iconClass)
    {
        this.#data.set('iconClass', iconClass);
        return this;
    }

    get iconClass()
    {
        return this.#data.get('iconClass');
    }

    set name(evidenceName)
    {
        this.#data.set('name', evidenceName);
        return this;
    }

    get name()
    {
        return this.#data.get('name');
    }
}