import { getAssetDiff } from './get-asset-diff.js';
import { sortDiffDescending } from './sort-diff-descending.js';
export function viteStatsDiff(oldAssets, newAssets) {
    const added = [];
    const removed = [];
    const bigger = [];
    const smaller = [];
    const unchanged = [];
    let newSizeTotal = 0;
    let oldSizeTotal = 0;
    let newGzipSizeTotal = 0;
    let oldGzipSizeTotal = 0;
    for (const [assetId, oldAssetSizes] of oldAssets) {
        oldSizeTotal += oldAssetSizes.size;
        oldGzipSizeTotal += oldAssetSizes.gzipSize ?? Number.NaN;
        const newAsset = newAssets.get(assetId) ||
            Array.from(newAssets.values()).find((a) => a.originalName === oldAssetSizes.originalName);
        if (!newAsset) {
            removed.push(getAssetDiff(oldAssetSizes.name, oldAssetSizes, { size: 0, gzipSize: 0 }));
        }
        else {
            const diff = getAssetDiff(oldAssetSizes.name, oldAssetSizes, newAsset);
            if (diff.diffPercentage > 0) {
                bigger.push(diff);
            }
            else if (diff.diffPercentage < 0) {
                smaller.push(diff);
            }
            else {
                unchanged.push(diff);
            }
        }
    }
    for (const [assetId, newAssetSizes] of newAssets) {
        newSizeTotal += newAssetSizes.size;
        newGzipSizeTotal += newAssetSizes.gzipSize ?? Number.NaN;
        const oldAsset = oldAssets.get(assetId) ||
            Array.from(oldAssets.values()).find((a) => a.originalName === newAssetSizes.originalName);
        if (!oldAsset) {
            added.push(getAssetDiff(newAssetSizes.name, { size: 0, gzipSize: 0 }, newAssetSizes));
        }
    }
    const oldFilesCount = oldAssets.size;
    const newFilesCount = newAssets.size;
    return {
        added: sortDiffDescending(added),
        removed: sortDiffDescending(removed),
        bigger: sortDiffDescending(bigger),
        smaller: sortDiffDescending(smaller),
        unchanged,
        total: getAssetDiff(oldFilesCount === newFilesCount ? `${newFilesCount}` : `${oldFilesCount} → ${newFilesCount}`, { size: oldSizeTotal, gzipSize: oldGzipSizeTotal }, { size: newSizeTotal, gzipSize: newGzipSizeTotal }),
    };
}
