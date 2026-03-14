
import { access, constants } from 'node:fs/promises';

/* Check if File Exists */
export async function fileExists(filePath: string) {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}
