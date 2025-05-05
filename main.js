import {getEnvVariable} from './cli/env.js';
import {homedir} from 'node:os';
import {printDirectoryContent} from './cli/print.js';
import {resolve} from 'node:path';
import {catFile} from "./fs/catFile.js";

const username = getEnvVariable('username');
console.log(`Welcome to the File Manager, ${username}!`);

let currentDirectory = homedir();
printCurrentDirectory();

process.stdin.on('data', async (data) => {
  const input = data.toString();
  try {
    if (input === 'ls\n') {
      await printDirectoryContent(currentDirectory);
    } else if (input.startsWith('cat ')) {
      const filePath = input.split(' ')[1].trim();
      const absolutePath = resolveInputPath(filePath);

      await catFile(absolutePath);
    } else if (input === '.exit\n') {
      programExit();
    } else {
      console.log('Invalid input');
    }
  } catch (e) {
    console.log('Operation failed');
  } finally {
    printCurrentDirectory();
  }
});

process.on('SIGINT', () => {
  programExit();
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
