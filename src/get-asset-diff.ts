import type { AssetDiff, Sizes } from './types.js';

export function getAssetDiff(name: string, oldSize: Sizes, newSize: Sizes): AssetDiff {
  return {
    name,
    new: {
      size: newSize.size,
      gzipSize: newSize.gzipSize ?? Number.NaN,
    },
    old: {
      size: oldSize.size,
      gzipSize: oldSize.gzipSize ?? Number.NaN,
    },
    diff: newSize.size - oldSize.size,
    diffPercentage: +((1 - newSize.size / oldSize.size) * -100).toFixed(5) || 0,
  };
}
