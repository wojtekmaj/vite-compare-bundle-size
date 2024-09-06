import type { SizesWithName, StatsAsset } from './types.js';
export declare function assetNameToSizeMap(statAssets?: StatsAsset[]): Map<string, SizesWithName>;
export declare function chunkModuleNameToSizeMap(statsAssets?: StatsAsset[]): Map<string, SizesWithName>;
