import {createReadStream} from 'node:fs';
import {access, stat} from "node:fs/promises";

export async function catFile(filePath) {
  return new Promise(async (resolve, reject) => {
    await access(filePath).catch(() => {
      reject();
      throw Error('File not found');
    });

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      reject();
      throw Error('Not a file');
    }

    createReadStream(filePath).pipe(process.stdout)
      .on('unpipe', () => {
        resolve();
      });
  })
}
