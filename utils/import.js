import { pathToFileURL } from 'url';
import { join } from 'path';

export async function importFile(...pathParts) {
    return await import(pathToFileURL(join(...pathParts)))
}