import * as os from 'node:os';
import {resolve} from 'node:path';
import {access, stat} from 'node:fs/promises';

import {getConsoleArgument} from './cli/env.js';
import {printDirectoryContent} from './cli/print.js';
import {catFile} from './fs/catFile.js';
import {addFile} from './fs/addFile.js';
import {createDirectory} from './fs/createDirectory.js';
import {deleteFile} from './fs/deleteFile.js';
import {renameFile} from './fs/renameFile.js';
import {copyFile} from './fs/copyFile.js';
import {moveFile} from './fs/moveFile.js';
import {hashFile} from './hash/hashFile.js';
import {compressFile} from './zip/compress.js';
import {decompressFile} from './zip/decompress.js';

const username = getConsoleArgument('username');
console.log(`Welcome to the File Manager, ${username}!`);

let currentDirectory = os.homedir();
printCurrentDirectory();

const osHandlers = {
  '--EOL': async () => {
    console.log(os.EOL.replace(/\n/g, '\\n'));
  },
  '--cpus': async () => {
    const cpuInfo = os.cpus();

    console.log(`Overall amount of CPUs: ${cpuInfo.length}`);
    console.log('\nCPU Details:');

    cpuInfo.forEach((cpu, index) => {
      // Convert speed from MHz to GHz with 2 decimal places
      const clockRateGHz = (cpu.speed / 1000).toFixed(2);
      console.log(`CPU ${index + 1}: ${cpu.model} (${clockRateGHz} GHz)`);
    });
  },
  '--homedir': async () => {
    console.log(os.homedir());
  },
  '--username': async () => {
    console.log(os.userInfo().username);
  },
  '--architecture': async () => {
    console.log(process.arch);
  }
}

const handlers = {
  'ls': async () => {
    await printDirectoryContent(currentDirectory);
  },
  'cat': async (input) => {
    const [path] = parsePathsFromInput(input);
    await catFile(path);
  },
  'cd': async (input) => {
    const [path] = parsePathsFromInput(input);
    await changeDirectory(path);
  },
  'add': async (input) => {
    const [path] = parsePathsFromInput(input);
    await addFile(path);
  },
  'mkdir': async (input) => {
    const [path] = parsePathsFromInput(input);
    await createDirectory(path);
  },
  'rm': async (input) => {
    const [path] = parsePathsFromInput(input);
    await deleteFile(path);
  },
  'rn': async (input) => {
    const [filePath, newFilePath] = parsePathsFromInput(input);
    await renameFile(filePath, newFilePath);
  },
  'cp': async (input) => {
    const [filePath, newFilePath] = parsePathsFromInput(input);
    await copyFile(filePath, newFilePath);
  },
  'mv': async (input) => {
    const [filePath, newFilePath] = parsePathsFromInput(input);
    await moveFile(filePath, newFilePath);
  },
  'up': async () => {
    const absolutePath = resolveInputPath('..');
    await changeDirectory(absolutePath);
  },
  'os': async (input) => {
    const [argument] = parseArguments(input);

    const osHandler = osHandlers[argument];

    if (osHandler) {
      await osHandler();
    } else {
      throw Error('Invalid argument');
    }
  },
  'hash': async (input) => {
    const [path] = parsePathsFromInput(input);
    const hash = await hashFile(path);
    console.log(hash);
  },
  'compress': async (input) => {
    const [filePath, newFilePath] = parsePathsFromInput(input);
    await compressFile(filePath, newFilePath);
  },
  'decompress': async (input) => {
    const [filePath, newFilePath] = parsePathsFromInput(input);
    await decompressFile(filePath, newFilePath);
  },
  '.exit': async () => {
    programExit();
  }
};

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
  const input = data.toString().trim();
  const command = input.split(' ')[0];
  try {
    const handler = handlers[command];

    if (handler) {
      await handler(input);
    } else {
      console.log('Invalid command');
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
