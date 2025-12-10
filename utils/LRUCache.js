export class LRUCache {
    constructor(maxSize = 20) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;

        // Move the key to the end to mark it as recently used
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            // Remove and re-add to update usage order
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove oldest used entry
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    size() {
        return this.cache.size;
    }
}
