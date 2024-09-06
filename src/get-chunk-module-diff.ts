import { chunkModuleNameToSizeMap } from './name-to-size-map.js';
import { viteStatsDiff } from './vite-stats-diff.js';

import type { ViteStatsDiff, StatsAsset } from './types.js';

export function getChunkModuleDiff(
  oldStatsAsset: StatsAsset[],
  newStatsAsset: StatsAsset[],
): ViteStatsDiff | null {
  if (!oldStatsAsset || !newStatsAsset) {
    return null;
  }

  return viteStatsDiff(
    chunkModuleNameToSizeMap(oldStatsAsset),
    chunkModuleNameToSizeMap(newStatsAsset),
  );
}
