import { describe, expect, test } from 'vitest';

import { getDescribeAssetsOptions } from '../src/index.js';
import { describeAssetsSections } from '../src/types.js';

import type { DescribeAssetsSection } from '../src/types.js';

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
