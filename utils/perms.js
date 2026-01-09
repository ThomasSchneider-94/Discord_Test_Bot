export function formatPermission(perm) {
    return perm
        .replace(/([A-Z])/g, ' $1') // split words
        .replace(/^./, str => str.toUpperCase()) // capitalize first
        .trim();
}