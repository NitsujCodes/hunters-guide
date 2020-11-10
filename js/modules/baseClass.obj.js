export default class baseClass
{
    #customProps;

    constructor() {
        this.#customProps = new Map();
    };

    getProp(customProp)
    {
        return this.#customProps.get(customProp);
    }

    setProp(customProp, value)
    {
        if (typeof value === 'undefined' && typeof customProp === 'object') {
            for (let key in customProp) {
                if (customProp.hasOwnProperty(key)) {
                    this.#customProps.set(key, customProp[key]);
                }
            }
        } else {
            this.#customProps.set(customProp, value);
        }

        return this;
    }
}