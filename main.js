import {getEnvVariable} from './cli/env.js';
import {printDirectoryContent} from './cli/print.js';
import {catFile} from './fs/catFile.js';
import {addFile} from './fs/addFile.js';
import {createDirectory} from "./fs/createDirectory.js";
import {homedir} from 'node:os';
import {resolve} from 'node:path';
import {access, stat} from 'node:fs/promises';
import {deleteFile} from "./fs/deleteFile.js";
import {renameFile} from "./fs/renameFile.js";
import {copyFile} from "./fs/copyFile.js";

const username = getEnvVariable('username');
console.log(`Welcome to the File Manager, ${username}!`);

let currentDirectory = homedir();
printCurrentDirectory();

function changeDirectory(directoryPath) {
  return access(directoryPath).then(async () => {
    await stat(directoryPath).then((fileStat) => {
      if (!fileStat.isDirectory()) {
        throw Error('Not a directory');
      }

      currentDirectory = directoryPath;
    })
  });
}

function parseFilePathFromSecondArgument(input) {
  const filePath = input.split(' ')[1].trim();

  return resolveInputPath(filePath);
}

process.stdin.on('data', async (data) => {
  const input = data.toString();
  try {
    if (input === 'ls\n') {
      await printDirectoryContent(currentDirectory);
    } else if (input.startsWith('cat ')) {
      const filePath = input.split(' ')[1].trim();
      const absolutePath = resolveInputPath(filePath);

      await catFile(absolutePath);
    } else if (input.startsWith('cd ')) {
      const path = parseFilePathFromSecondArgument(input);

      await changeDirectory(path);
    } else if (input.startsWith('add ')) {
      const path = parseFilePathFromSecondArgument(input);

      await addFile(path);
    } else if (input.startsWith('mkdir ')) {
      const path = parseFilePathFromSecondArgument(input);

      await createDirectory(path);
    } else if (input.startsWith('rm ')) {
      const path = parseFilePathFromSecondArgument(input);

      await deleteFile(path);
    } else if (input.startsWith('rn ')) {
      const args = input.split(' ');
      const filePath = resolveInputPath(args[1].trim());
      const newFilePath = resolveInputPath(args[2].trim());

      await renameFile(filePath, newFilePath);
    } else if (input.startsWith('cp ')) {
      const args = input.split(' ');
      const filePath = resolveInputPath(args[1].trim());
      const newFilePath = resolveInputPath(args[2].trim());

      await copyFile(filePath, newFilePath);
    } else if (input === 'up\n') {
      const absolutePath = resolveInputPath('..');

      await changeDirectory(absolutePath);
    } else if (input === '.exit\n') {
      programExit();
    } else {
      console.log('Invalid input');
    }
  } catch (e) {
    console.log('Operation failed');
  }

  printCurrentDirectory();
});

process.on('SIGINT', () => {
  programExit();
});

process.on('uncaughtException', (error) => {
  console.log('Operation failed');
  printCurrentDirectory();
});

function programExit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
}

function printCurrentDirectory() {
  process.stdout.write(`You are currently in ${currentDirectory}: `)
}

function resolveInputPath(path) {
  if (!path) {
    throw Error('Invalid path');
  }

  return resolve(currentDirectory, path);
}
