import { beforeAll, describe, expect, test } from 'vitest';

import afterStats from '../fixtures/basic/after.json' with { type: 'json' };
import beforeStats from '../fixtures/basic/before.json' with { type: 'json' };
import afterUnchangedStats from '../fixtures/technically-unchanged/after.json' with {
  type: 'json',
};
import beforeUnchangedStats from '../fixtures/technically-unchanged/before.json' with {
  type: 'json',
};
import { getChunkModuleDiff } from '../src/get-chunk-module-diff.js';
import { getStatsDiff } from '../src/get-stats-diff.js';
import {
  printAssetTablesByGroup,
  printChunkModulesTable,
  printTotalAssetTable,
} from '../src/print-markdown.js';
import { describeAssetsSections } from '../src/types.js';

import type { DescribeAssetsOptions, ViteStatsDiff } from '../src/types.js';

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

test('Shows stats when files are unchanged (technically unchanged fixture)', async () => {
  const statsDiff = getStatsDiff(beforeUnchangedStats, afterUnchangedStats);

  expect(printTotalAssetTable(statsDiff)).toMatchSnapshot();
  expect(printAssetTablesByGroup(statsDiff)).toMatchSnapshot();
});

test('does not display module information when it does not exist', async () => {
  const statsDiff = getChunkModuleDiff(beforeStats, beforeStats);

  expect(printChunkModulesTable(statsDiff)).toMatchSnapshot();
});

describe('printAssetTablesByGroup describes asset sections as requested', () => {
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
