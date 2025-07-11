import {access, mkdir} from 'node:fs/promises';

export function createDirectory(path) {
  return access(path)
    .then(() => {
      throw Error('Directory already exists');
    })
    .catch(async () => {
      await mkdir(path);
    });
}
