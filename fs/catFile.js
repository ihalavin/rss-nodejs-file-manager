import {createReadStream} from 'node:fs';
import {access, stat} from 'node:fs/promises';

export async function catFile(filePath) {
  await access(filePath);

  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    throw Error('Not a file');
  }

  await new Promise((resolve, reject) => {
    createReadStream(filePath).pipe(process.stdout)
      .on('unpipe', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
