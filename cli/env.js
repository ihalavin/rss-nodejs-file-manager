export function getEnvVariable(name) {
  const args = process.argv.slice(2);
  const variable = args.find((entry) => entry.startsWith(`--${name}`));

  return variable ? variable.split('=')[1] : null;
}
