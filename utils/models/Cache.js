import { Queue } from "./Queue.js";

export class Cache {
    constructor(maxSize = 20) {
        this.keys = new Queue();
        this.values = new Map();
        this.maxSize = maxSize;
    }

    set(key, value) {
        if (this.values.has(key)) {
            // Move the key to the end to mark it as recently used
            this.keys.delete(key);
            this.keys.add(key);
            return;
        }
        if (this.keys.length >= this.maxSize) {
            // Remove oldest used entry
            const oldestKey = this.keys.next();
            this.values.delete(oldestKey);
        }

        this.keys.add(key);
        this.values.set(key, value);
    }

    get(key) {
        if (!this.values.has(key)) return undefined;

        // Move the key to the end to mark it as recently used
        this.keys.delete(key);
        this.keys.add(key);
        return this.values.get(key);
    }

    has(key) {
        return this.values.has(key);
    }

    delete(key) {
        if (!this.values.has(key)) return false;

        this.keys.delete(key);
        return this.values.delete(key);
    }

    get size() {
        return this.keys.length;
    }
}
