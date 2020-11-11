export default class baseClass
{
    #customProps;
    #isChecks;
    #customPropUpdaters;

    constructor() {
        this.#customProps = new Map();
        this.#isChecks = new Map();
    };

    prop(customProp)
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

    addPropAutoUpdate(customProp, callable)
    {
        this.#customPropUpdaters.set(customProp, callable);
    }

    autoUpdateProp(customProp, ...propArgs)
    {
        propArgs.unshift(this.#customProps.get(customProp));
        return this.#customPropUpdaters.get(customProp).call(this, propArgs);
    }

    addIsCheck(key, callable)
    {
        this.#isChecks.set(key, callable);

        return this;
    }

    is(check, ...callableArgs)
    {
        return (this.#isChecks.get(check).call(this, callableArgs));
    }
}