import {getEnvVariable} from './cli/env.js';
import {homedir} from 'node:os';
import {readdir, stat} from 'node:fs/promises';
import * as path from 'node:path';

const username = getEnvVariable('username');
console.log(`Welcome to the File Manager, ${username}!`);

let currentDirectory = homedir();
printCurrentDirectory();

function getDirectoryContent(directory) {
  readdir(directory).then((files) => {
    let results = {};
    files.forEach((file) => {
      stat(path.join(directory, file)).then((stat) => {
        results.append({
          name: file,
          type: stat.isDirectory() ? 'directory' : 'file',
        });
      });
    });

    return results;
  });

  return {};
}

function printDirectoryContent(content) {
  // Define column headers and widths
  const headers = ['Index', 'Name', 'Type'];
  
  // Find the maximum width needed for each column
  const nameWidth = Math.max(
    'Name'.length,
    ...content.map(item => item.name.length)
  );
  
  const typeWidth = Math.max(
    'Type'.length,
    ...content.map(item => item.type.length)
  );
  
  const indexWidth = Math.max(
    'Index'.length,
    content.length.toString().length
  );
  
  // Create header row
  console.log(
    `| ${headers[0].padEnd(indexWidth)} | ${headers[1].padEnd(nameWidth)} | ${headers[2].padEnd(typeWidth)} |`
  );
  
  // Create separator row
  console.log(
    `| ${'-'.repeat(indexWidth)} | ${'-'.repeat(nameWidth)} | ${'-'.repeat(typeWidth)} |`
  );
  
  // Create content rows
  content.forEach((item, index) => {
    console.log(
      `| ${index.toString().padEnd(indexWidth)} | ${item.name.padEnd(nameWidth)} | ${item.type.padEnd(typeWidth)} |`
    );
  });
}

process.stdin.on('data', (data) => {
  const input = data.toString();
  if (input === 'ls\n') {
    const content = getDirectoryContent(currentDirectory);
    printDirectoryContent(content);
  } else if (input === '.exit\n') {
    programExit();
  } else {
    console.log('Invalid input');
  }

  printCurrentDirectory();
});

process.on('SIGINT', () => {
  programExit();
})

function programExit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
}

function printCurrentDirectory() {
  console.log(`You are currently in ${currentDirectory}`);
}
