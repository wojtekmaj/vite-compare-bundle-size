import { beforeAll, describe, expect, test } from 'vitest';

import { getChunkModuleDiff } from '../src/get-chunk-module-diff.js';
import { getStatsDiff } from '../src/get-stats-diff.js';
import { getDescribeAssetsOptions } from '../src/index.js';
import { assetNameToSizeMap } from '../src/name-to-size-map.js';
import {
  printAssetTablesByGroup,
  printChunkModulesTable,
  printTotalAssetTable,
} from '../src/print-markdown.js';
import { describeAssetsSections } from '../src/types.js';
import afterStats from './fixtures/basic/after.json' with { type: 'json' };
import beforeStats from './fixtures/basic/before.json' with { type: 'json' };
import afterUnchangedStats from './fixtures/technically-unchanged/after.json' with { type: 'json' };
import beforeUnchangedStats from './fixtures/technically-unchanged/before.json' with {
  type: 'json',
};

import type { DescribeAssetsOptions, DescribeAssetsSection, ViteStatsDiff } from '../src/types.js';

test('Shows stats when files are removed', async () => {
  const statsDiff = getStatsDiff(beforeStats, afterStats);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('Shows stats when files are added', async () => {
  const statsDiff = getStatsDiff(beforeStats, afterStats);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('Shows stats when files are unchanged', async () => {
  const statsDiff = getStatsDiff(beforeStats, beforeStats);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('Shows stats when files are unchanged (2)', async () => {
  const statsDiff = getStatsDiff(beforeUnchangedStats, afterUnchangedStats);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('does not display module information when it does not exist', async () => {
  const statsDiff = getChunkModuleDiff(beforeStats, beforeStats);

  expect(printChunkModulesTable(statsDiff)).toMatchSnapshot();
});

describe('printAssetTablesByGroup describes asset sections as requested', () => {
  // generate all combinations of sections
  const cases: DescribeAssetsOptions[] = [];

  for (let i = 0; i < 2 ** describeAssetsSections.length; i++) {
    const options = {} as DescribeAssetsOptions;

    for (let n = 0; n < describeAssetsSections.length; n++) {
      const section = describeAssetsSections[n];

      if (!section) {
        throw new Error('section is undefined');
      }

      if ((i >> n) & 1) {
        options[section] = true;
      } else {
        options[section] = false;
      }
    }

    cases.push(options);
  }

  let statsDiff: ViteStatsDiff;

  beforeAll(async () => {
    statsDiff = getStatsDiff(beforeStats, afterStats);
  });

  test.each(cases)('printAssetTablesByGroup: %j', (options: DescribeAssetsOptions) => {
    const assetTables = printAssetTablesByGroup(statsDiff, options);
    for (const [section, included] of Object.entries(options)) {
      const sectionHeader = `**${section.charAt(0).toUpperCase()}${section.slice(1)}**`;

      if (included) {
        expect(assetTables).toContain(sectionHeader);
      } else {
        expect(assetTables).not.toContain(sectionHeader);
      }
    }

    if (Object.entries(options).every(([, included]) => included === false)) {
      expect(assetTables).toBe('');
    }
  });
});

describe('getDescribeAssetsOptions', () => {
  test(`getDescribeAssetsOptions: "all"`, () => {
    const generatedOptions = getDescribeAssetsOptions('all');
    for (const section of describeAssetsSections) {
      expect(generatedOptions[section]).toBe(true);
    }
  });

  test(`getDescribeAssetsOptions: "none"`, () => {
    const generatedOptions = getDescribeAssetsOptions('none');
    for (const section of describeAssetsSections) {
      expect(generatedOptions[section]).toBe(false);
    }
  });

  test(`getDescribeAssetsOptions: "changed-only"`, () => {
    const generatedOptions = getDescribeAssetsOptions('changed-only');
    for (const section of describeAssetsSections) {
      if (section === 'unchanged') {
        expect(generatedOptions[section]).toBe(false);
      } else {
        expect(generatedOptions[section]).toBe(true);
      }
    }
  });

  test('getDescribeAssetsOptions: handles keyword with spaces', () => {
    const generatedOptions = getDescribeAssetsOptions('   all  ');
    for (const section of describeAssetsSections) {
      expect(generatedOptions[section]).toBe(true);
    }
  });

  test('getDescribeAssetsOptions: unsupported option throws', () => {
    expect(() => getDescribeAssetsOptions('unsupported options')).toThrow();
  });

  // generate all combinations of sections as string
  const cases: string[] = [];
  for (let i = 0; i < 2 ** describeAssetsSections.length; i++) {
    const options: string[] = [];

    for (let n = 0; n < describeAssetsSections.length; n++) {
      const section = describeAssetsSections[n];

      if (!section) {
        throw new Error('section is undefined');
      }

      if ((i >> n) & 1) {
        options.push(section);
      }
    }

    if (options.length > 0) {
      cases.push(options.join(' '));
    }
  }

  test.each(cases)('getDescribeAssetsOptions: %j', (optionString: string) => {
    const generatedOptions = getDescribeAssetsOptions(optionString);
    const providedOptions = optionString.split(' ');
    for (const section of providedOptions) {
      expect(generatedOptions[section as DescribeAssetsSection]).toBe(true);
    }
    for (const section of describeAssetsSections.filter((s) => !providedOptions.includes(s))) {
      expect(generatedOptions[section]).toBe(false);
    }
  });

  test('getDescribeAssetsOptions: handles sections with spaces', () => {
    const optionString = ' added   removed  bigger';
    const generatedOptions = getDescribeAssetsOptions(optionString);
    for (const section of describeAssetsSections) {
      expect(generatedOptions[section]).toBe(optionString.includes(section));
    }
  });
});

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

describe('technically unchanged fixtures', () => {
  test('do not report added or removed assets', () => {
    const statsDiff = getStatsDiff(beforeUnchangedStats, afterUnchangedStats);

    expect(statsDiff.added).toHaveLength(0);
    expect(statsDiff.removed).toHaveLength(0);
  });

  test('do not report total bundle size changes', () => {
    const statsDiff = getStatsDiff(beforeUnchangedStats, afterUnchangedStats);

    expect(statsDiff.total.diff).toBe(0);
    expect(statsDiff.total.old.gzipSize).toBe(statsDiff.total.new.gzipSize);
  });
});
