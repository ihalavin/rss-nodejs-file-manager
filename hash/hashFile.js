import {access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';

export async function hashFile(filePath) {
  const hash = createHash('SHA256');
  await access(filePath).then(async () => {
    await new Promise((resolve) => {
      createReadStream(filePath).pipe(hash)
        .on('finish', () => {
          resolve();
        });
    });
  }).catch(() => {
    throw new Error('File does not exist');
  });

  return hash.digest('hex');
}
