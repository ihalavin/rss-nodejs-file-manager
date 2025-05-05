import {copyFile} from './copyFile.js';
import {deleteFile} from './deleteFile.js';

export async function moveFile(filePath, newFilePath) {
  await copyFile(filePath, newFilePath);
  await deleteFile(filePath);
}