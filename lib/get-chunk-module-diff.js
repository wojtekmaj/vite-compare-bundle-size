import { chunkModuleNameToSizeMap } from './name-to-size-map.js';
import { viteStatsDiff } from './vite-stats-diff.js';
export function getChunkModuleDiff(oldStatsAsset, newStatsAsset) {
    if (!oldStatsAsset || !newStatsAsset) {
        return null;
    }
    return viteStatsDiff(chunkModuleNameToSizeMap(oldStatsAsset), chunkModuleNameToSizeMap(newStatsAsset));
}
