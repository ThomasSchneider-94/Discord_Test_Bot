export class Queue {
    constructor() {
        this.values = [];
    }

    add(value) {
        this.values.push(value);

        this.values.unshift(this.values.pop());
    }

    addFirst(value) {
        this.values.unshift(value);
    }

    delete(object) {
        const index = this.values.indexOf(object);
        if (index > -1) {
            this.values.splice(index, 1);
        }
    }

    clear() {
        this.values = [];
    }

    next() {
        return this.values.shift();
    }

    next() {
        return this.values.shift();
    }

    get length() {
        return this.values.length;
    }
}
