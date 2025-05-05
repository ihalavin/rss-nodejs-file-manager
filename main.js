import * as os from 'node:os';
import {resolve} from 'node:path';
import {access, stat} from 'node:fs/promises';

import {getEnvVariable} from './cli/env.js';
import {printDirectoryContent} from './cli/print.js';
import {catFile} from './fs/catFile.js';
import {addFile} from './fs/addFile.js';
import {createDirectory} from './fs/createDirectory.js';
import {deleteFile} from './fs/deleteFile.js';
import {renameFile} from './fs/renameFile.js';
import {copyFile} from './fs/copyFile.js';
import {moveFile} from './fs/moveFile.js';
import {hashFile} from './hash/hashFile.js';

const username = getEnvVariable('username');
console.log(`Welcome to the File Manager, ${username}!`);

let currentDirectory = os.homedir();
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

function parseArguments(input) {
  const args = input.split(' ').slice(1);

  return args.map((arg) => arg.trim());
}

function parsePathsFromInput(input) {
  const args = parseArguments(input);

  return args.map((arg) => resolveInputPath(arg));
}

process.stdin.on('data', async (data) => {
  const input = data.toString();
  try {
    if (input === 'ls\n') {
      await printDirectoryContent(currentDirectory);
    } else if (input.startsWith('cat ')) {
      const [path] = parsePathsFromInput(input);

      await catFile(path);
    } else if (input.startsWith('cd ')) {
      const [path] = parsePathsFromInput(input);

      await changeDirectory(path);
    } else if (input.startsWith('add ')) {
      const [path] = parsePathsFromInput(input);

      await addFile(path);
    } else if (input.startsWith('mkdir ')) {
      const [path] = parsePathsFromInput(input);

      await createDirectory(path);
    } else if (input.startsWith('rm ')) {
      const [path] = parsePathsFromInput(input);

      await deleteFile(path);
    } else if (input.startsWith('rn ')) {
      const [filePath, newFilePath] = parsePathsFromInput(input);

      await renameFile(filePath, newFilePath);
    } else if (input.startsWith('cp ')) {
      const [filePath, newFilePath] = parsePathsFromInput(input);

      await copyFile(filePath, newFilePath);
    } else if (input.startsWith('mv ')) {
      const [filePath, newFilePath] = parsePathsFromInput(input);

      await moveFile(filePath, newFilePath);
    } else if (input === 'up\n') {
      const absolutePath = resolveInputPath('..');

      await changeDirectory(absolutePath);
    } else if (input.startsWith('os ')) {
      const [argument] = parseArguments(input);

      if (argument === '--EOL') {
        console.log(os.EOL.replace(/\n/g, '\\n'));
      } else if (argument === '--cpus') {
        const cpuInfo = os.cpus();

        console.log(`Overall amount of CPUs: ${cpuInfo.length}`);
        console.log('\nCPU Details:');

        cpuInfo.forEach((cpu, index) => {
          // Convert speed from MHz to GHz with 2 decimal places
          const clockRateGHz = (cpu.speed / 1000).toFixed(2);
          console.log(`CPU ${index + 1}: ${cpu.model} (${clockRateGHz} GHz)`);
        });
      } else if (argument === '--homedir') {
        console.log(os.homedir());
      } else if (argument === '--username') {
        console.log(os.userInfo().username);
      } else if (argument === '--architecture') {
        console.log(process.arch);
      }
    } else if (input.startsWith('hash ')) {
      const [path] = parsePathsFromInput(input);

      const hash = await hashFile(path);
      console.log(hash);
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

process.on('uncaughtException', () => {
  console.log('Operation failed');
  printCurrentDirectory();
});

function programExit() {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  process.exit();
}

function printCurrentDirectory() {
  process.stdout.write(`\nYou are currently in \x1b[32m[${currentDirectory}]\x1b[0m: `)
}

function resolveInputPath(path) {
  if (!path) {
    throw Error('Invalid path');
  }

  return resolve(currentDirectory, path);
}
