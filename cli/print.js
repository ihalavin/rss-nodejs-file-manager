import {readdir, stat} from "node:fs/promises";
import path from "node:path";

async function getDirectoryContent(directory) {
  const files = await readdir(directory);
  return await Promise.all(files.map(async (file) => {
    const fileStat = await stat(path.join(directory, file));
    return {
      name: file, type: fileStat.isDirectory() ? 'directory' : 'file',
    };
  }));
}

function sortDirectoryContent(content) {
  content.sort((a, b) => {
    const aIsDirectory = a.type === 'directory';
    const bIsDirectory = b.type === 'directory';

    if (aIsDirectory && !bIsDirectory) {
      return -1;
    } else if (aIsDirectory === bIsDirectory) {
      return a.name.localeCompare(b.name);
    }

    return 1;
  });
}

export async function printDirectoryContent(directory) {
  const content = await getDirectoryContent(directory);
  const headers = ['name', 'type'];
  sortDirectoryContent(content);

  console.table(content, headers);
}
