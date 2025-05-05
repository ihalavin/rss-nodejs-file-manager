import {access, rename} from "node:fs/promises";

export async function renameFile(filePath, newFilePath) {
  await access(filePath);

  return access(newFilePath).catch(async () => {
    await rename(filePath, newFilePath);
  });
}
