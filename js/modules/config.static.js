export default class Config
{
    static #data = new Map();
    static #hasChildren = new Set();
    static #structureLocked = false;
    static #validators = new Map();

    static get(key)
    {
        return this.#data.get(key);
    }

    static set(key, value, validator)
    {
        if (typeof key === 'object' && typeof value === 'undefined') {
            for (let actualKey in key) {
                if (key.hasOwnProperty(actualKey)) {
                    this.set(actualKey, key[actualKey]);
                }
            }

            return this;
        }

        if (this.#data.has(key) && this.#hasChildren.has(key) && !this.#structureLocked) {
            //The path exists and it has children
            this.#recursiveDelete(key);
            this.#hasChildren.delete(key);
            this.#data.set(key, value);
        } else if (!this.#data.has(key)) {
            this.#data.set(key, value);
            this.#pathSet(key);
        } else {
            console.warn('Config: Structure is locked and so cannot be modified');
            return this;
        }

        if (typeof validator !== 'undefined') {
            this.#validators.set(key, validator);
        }

        return this;
    }

    static has(key)
    {
        return this.#data.has(key);
    }

    static #isValid(key, value)
    {
        if (!this.#data.has(key)) {
            return true;
        } else if (this.#validators.has(key)) {
            //We have a validator for this key
            return (this.#validators.get(key)(this.#data.get(key), value));
        }

        return true;
    }

    static #pathSet(key)
    {
        let splitKey = key.split('.');
        let previousFullKey = key;
        let currentKey = splitKey.pop();
        let nextKeyJoin = splitKey.join('.');

        for (let i = (splitKey.length - 1); i >= 0; i--) {
            if (!this.#data.has(nextKeyJoin)) {
                this.#data.set(nextKeyJoin, new Map());
                this.#hasChildren.add(nextKeyJoin);
            }

            this.#data.get(nextKeyJoin).set(currentKey, this.#data.get(previousFullKey));

            previousFullKey = nextKeyJoin;
            currentKey = splitKey.pop();
            nextKeyJoin = splitKey.join('.');
        }
    }

    static #recursiveDelete(currentPathString)
    {
        let pathString;

        for (const [nextKey, nextRef] of this.#data.get(currentPathString)) {
            pathString = currentPathString + '.' + nextKey;
            if (this.#hasChildren.has(pathString)) {
                //Also has children so go deeper
                this.#recursiveDelete(pathString);
            }

            this.#data.delete(pathString);
            this.#hasChildren.delete(pathString);
        }
    }

    static debug()
    {
        console.warn('[Config Debug]');
        console.warn('--Data');
        console.log(this.#data);
        console.warn('--Has Children');
        console.log(this.#hasChildren);
        console.warn('--Lock');
        console.log((this.#structureLocked) ? 'Structure is Locked' : 'Structure is not Locked');
    }

    static init(defaults, lockStructure = false)
    {
        this.#structureLocked = lockStructure;
        for (let key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                if (
                    typeof defaults[key] === 'object' && !defaults[key] instanceof Array &&
                    typeof defaults[key].validator !== 'undefined' && typeof defaults[key].value !== 'undefined'
                ) {
                    this.set(key, defaults[key].value, defaults[key].validator);
                } else {
                    this.set(key, defaults[key]);
                }
            }
        }

        return this;
    }
}