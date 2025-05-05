import {access} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createReadStream, createWriteStream} from 'node:fs';

export async function copyFile(filePath, newFilePath) {
  const parentDirectory = getPathParentDirectory(newFilePath);
  await access(filePath);
  await access(parentDirectory);

  await access(newFilePath)
    .then(() => {
      throw Error('File already exists');
    })
    .catch(async () => {
      createReadStream(filePath).pipe(createWriteStream(newFilePath));
    });
}

function getPathParentDirectory(path) {
  return dirname(path);
}
