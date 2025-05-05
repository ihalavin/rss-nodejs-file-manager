import {createReadStream, createWriteStream} from 'node:fs';
import {createBrotliDecompress} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {access, stat} from 'node:fs/promises';

export async function decompressFile(sourcePath, destinationPath) {
  await access(sourcePath);

  const fileStat = await stat(sourcePath);
  if (!fileStat.isFile()) {
    throw new Error('Source is not a file');
  }

  const brotliDecompress = createBrotliDecompress({
    params: {
      [Symbol.for('level')]: 11,
    }
  });

  const source = createReadStream(sourcePath);
  const destination = createWriteStream(destinationPath);

  return await pipeline(
    source,
    brotliDecompress,
    destination
  );
}
