import { assetNameToSizeMap } from './name-to-size-map.js';
import { viteStatsDiff } from './vite-stats-diff.js';
export function getStatsDiff(oldStatsAssets, newStatsAssets) {
    return viteStatsDiff(assetNameToSizeMap(oldStatsAssets), assetNameToSizeMap(newStatsAssets));
}
