import baseClass from './baseClass.obj.js';

export default class Ghost extends baseClass
{
    #key;
    #data = new Map();

    constructor(key, data)
    {
        super();

        this.#key = key;

        this.#data.set('name', data.name);
        this.#data.set('description', data.description);
        this.#data.set('uniqueStrength', data.uniqueStrength);
        this.#data.set('weakness', data.weakness);
        this.#data.set('evidence', data.evidence);
    }

    get key()
    {
        return this.#key;
    }

    set name(name)
    {
        this.#data.set('name', name);

        return this;
    }

    get name()
    {
        return this.#data.get('name');
    }

    set description(description)
    {
        this.#data.set('description', description);

        return this;
    }

    get description()
    {
        return this.#data.get('description');
    }

    set uniqueStrength(uniqueStrength)
    {
        this.#data.set('uniqueStrength', uniqueStrength);

        return this;
    }

    get uniqueStrength()
    {
        return this.#data.get('uniqueStrength');
    }

    set weakness(weakness)
    {
        this.#data.set('weakness', weakness);

        return this;
    }

    get weakness()
    {
        return this.#data.get('weakness');
    }

    set evidence(evidence)
    {
        this.#data.set('evidence', evidence);

        return this;
    }

    get evidence()
    {
        return this.#data.get('evidence');
    }
}