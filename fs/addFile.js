import {access, writeFile} from 'node:fs/promises';

export function addFile(filePath) {
  return access(filePath)
    .then(() => {
      throw Error('File already exists');
    })
    .catch(async () => {
      await writeFile(filePath, '');
    });
}
