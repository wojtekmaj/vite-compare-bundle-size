import { beforeAll, describe, expect, test } from 'vitest';

import { getChunkModuleDiff } from '../src/get-chunk-module-diff.js';
import { getStatsDiff } from '../src/get-stats-diff.js';
import { getDescribeAssetsOptions } from '../src/index.js';
import {
  printAssetTablesByGroup,
  printChunkModulesTable,
  printTotalAssetTable,
} from '../src/print-markdown.js';
import {
  type DescribeAssetsOptions,
  type DescribeAssetsSection,
  describeAssetsSections,
  type ViteStatsDiff,
} from '../src/types.js';

import newStatsAssets from './__mocks__/new-stats-assets.json' with { type: 'json' };
import oldStatsAssets from './__mocks__/old-stats-assets.json' with { type: 'json' };

test('Shows stats when files are removed', async () => {
  const statsDiff = getStatsDiff(oldStatsAssets, newStatsAssets);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('Shows stats when files are added', async () => {
  const statsDiff = getStatsDiff(oldStatsAssets, newStatsAssets);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('Shows stats when files are unchanged', async () => {
  const statsDiff = getStatsDiff(oldStatsAssets, oldStatsAssets);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('does not display module information when it does not exist', async () => {
  const statsDiff = getChunkModuleDiff(oldStatsAssets, oldStatsAssets);

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
    statsDiff = getStatsDiff(oldStatsAssets, newStatsAssets);
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
