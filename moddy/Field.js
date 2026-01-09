export class Field {
    constructor({type, defaultValue, nullable} = {}) {
        this.type = type;
        this.defaultValue = defaultValue;
        this.nullable = nullable;
    }
}
