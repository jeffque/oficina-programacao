import 'dotenv/config';
import { exit } from 'process';
import * as fs from 'fs';

const TARGET = process.argv[2];
console.log(TARGET)

if (!TARGET) {
    console.error("Must provide a target as first argument!")
    exit(1);
}

/**
 * create the base dir just behind a file
 * @param {string} filename 
 */
function createBaseDir(filename) {
    const base = filename.replace(/\/[^/]*$/, '/')

    if (!fs.existsSync(base)) {
        fs.mkdirSync(base, {recursive: true})
    }
}

/**
 * 
 * @param {string} target 
 * @param {string[]} source 
 * @returns {Promise<boolean>}
 */
async function mustGeneratefile(target, source) {
    if (!fs.existsSync(target)) {
        return true
    }
    const targetStat = await fs.promises.stat(target)
    for (const sourceName of source) {
        const sourceStat = await fs.promises.stat(sourceName)
        if (sourceStat.mtime.getTime() > targetStat.mtime.getTime()) {
            return true
        }
    }
    return false
}

/**
 * creates the desired source
 * @param {string} filename 
 */
async function createFile(filename) {
    createBaseDir(filename)

    if (!await mustGeneratefile(filename, [".env"])) {
        return
    }

    const f = await fs.promises.open(filename, "w")
    const writeStream = f.createWriteStream({autoClose: true});

    writeStream.write(`
export const REPO_NAME = '${process.env.REPO_NAME ?? "https://github.com/jeffque/peg-kitten-react.git"}'
        `.trim())
    writeStream.close()
    f.close()
}

await createFile(TARGET)