import { expect, test } from 'vitest';

import { assetNameToSizeMap } from '../src/name-to-size-map.js';

test('normalizes trailing 8-character Vite asset hashes', () => {
  const stats = [
    {
      filename: 'assets/index-lt-Jltkb.js',
      label: 'assets/index-lt-Jltkb.js',
      parsedSize: 1,
      gzipSize: 1,
    },
    {
      filename: 'assets/extra_content-DuWL2M-k.js',
      label: 'assets/extra_content-DuWL2M-k.js',
      parsedSize: 1,
      gzipSize: 1,
    },
    {
      filename: 'assets/arrow-right.js',
      label: 'assets/arrow-right.js',
      parsedSize: 1,
      gzipSize: 1,
    },
  ];

  const names = Array.from(assetNameToSizeMap(stats).values()).map((asset) => asset.name);

  expect(names).toContain('assets/index-[hash].js');
  expect(names).toContain('assets/extra_content-[hash].js');
  expect(names).toContain('assets/arrow-right.js');
});
