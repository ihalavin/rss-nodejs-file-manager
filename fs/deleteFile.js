import {access, rm} from "node:fs/promises";

export function deleteFile(filePath) {
  return access(filePath)
    .then(async () => {
      await rm(filePath);
    })
    .catch(() => {
      throw Error('File does not exist');
    });
}
