import { getEnvVariable } from './cli/env.js';

const username = getEnvVariable('username');
console.log(`Welcome to the File Manager, ${username}!`);

process.stdin.on('data', (data) => {
  switch (data.toString()) {
    case '.exit':
      programExit();
      break;
    default:
      console.log(data.toString());
  }
});

process.on('SIGINT', () => {
  programExit();
})

function programExit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
}
