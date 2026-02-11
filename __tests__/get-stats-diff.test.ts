import { describe, expect, test } from 'vitest';

import afterUnchangedStats from '../fixtures/technically-unchanged/after.json' with {
  type: 'json',
};
import beforeUnchangedStats from '../fixtures/technically-unchanged/before.json' with {
  type: 'json',
};
import { getStatsDiff } from '../src/get-stats-diff.js';

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

  test('does not drop one of duplicated base names when hash contains dashes', () => {
    const beforeStats = [
      {
        filename: 'assets/index-DqCJqD-p.js',
        label: 'assets/index-DqCJqD-p.js',
        parsedSize: 3529,
        gzipSize: 1985,
        source: [{ label: 'virtual-before/index-a.ts', parsedSize: 3529, gzipSize: 1985 }],
      },
      {
        filename: 'assets/index-Bwgjya7t.js',
        label: 'assets/index-Bwgjya7t.js',
        parsedSize: 8059,
        gzipSize: 4878,
        source: [{ label: 'virtual-before/index-b.ts', parsedSize: 8059, gzipSize: 4878 }],
      },
      {
        filename: 'assets/pie_chart-D1lMuZN4.js',
        label: 'assets/pie_chart-D1lMuZN4.js',
        parsedSize: 286952,
        gzipSize: 135289,
        source: [{ label: 'virtual-before/pie.ts', parsedSize: 286952, gzipSize: 135289 }],
      },
    ];

    const afterStats = [
      {
        filename: 'assets/index-BlnHo-Nd.js',
        label: 'assets/index-BlnHo-Nd.js',
        parsedSize: 3529,
        gzipSize: 1985,
        source: [{ label: 'virtual-after/index-a.ts', parsedSize: 3529, gzipSize: 1985 }],
      },
      {
        filename: 'assets/index-CV7P8aZ7.js',
        label: 'assets/index-CV7P8aZ7.js',
        parsedSize: 8059,
        gzipSize: 4878,
        source: [{ label: 'virtual-after/index-b.ts', parsedSize: 8059, gzipSize: 4878 }],
      },
      {
        filename: 'assets/pie_chart-CjtoGuuk.js',
        label: 'assets/pie_chart-CjtoGuuk.js',
        parsedSize: 286952,
        gzipSize: 135289,
        source: [{ label: 'virtual-after/pie.ts', parsedSize: 286952, gzipSize: 135289 }],
      },
    ];

    const statsDiff = getStatsDiff(beforeStats, afterStats);

    expect(statsDiff.total.name).toBe('3');
    expect(statsDiff.total.diff).toBe(0);
    expect(statsDiff.added).toHaveLength(0);
    expect(statsDiff.removed).toHaveLength(0);
    expect(statsDiff.unchanged).toHaveLength(3);
  });
});
