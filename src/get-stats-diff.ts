import { assetNameToSizeMap } from './name-to-size-map.js';
import { viteStatsDiff } from './vite-stats-diff.js';

import type { ViteStatsDiff, StatsAsset } from './types.js';

export function getStatsDiff(
  oldStatsAssets: StatsAsset[],
  newStatsAssets: StatsAsset[],
): ViteStatsDiff {
  return viteStatsDiff(assetNameToSizeMap(oldStatsAssets), assetNameToSizeMap(newStatsAssets));
}
