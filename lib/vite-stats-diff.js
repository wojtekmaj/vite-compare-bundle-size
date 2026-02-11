import { getAssetDiff } from './get-asset-diff.js';
import { sortDiffDescending } from './sort-diff-descending.js';
function findMatchingAsset(newAssetEntries, oldAssetId, oldAssetSizes) {
    const exactMatch = newAssetEntries.find((asset) => !asset.matched && asset.id === oldAssetId);
    if (exactMatch) {
        return exactMatch;
    }
    const originalNameMatch = newAssetEntries.find((asset) => !asset.matched && asset.sizes.originalName === oldAssetSizes.originalName);
    if (originalNameMatch) {
        return originalNameMatch;
    }
    const sameNameAndSizeMatch = newAssetEntries.find((asset) => !asset.matched &&
        asset.sizes.name === oldAssetSizes.name &&
        asset.sizes.size === oldAssetSizes.size &&
        asset.sizes.gzipSize === oldAssetSizes.gzipSize);
    if (sameNameAndSizeMatch) {
        return sameNameAndSizeMatch;
    }
    return newAssetEntries.find((asset) => !asset.matched && asset.sizes.name === oldAssetSizes.name);
}
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
    const newAssetEntries = Array.from(newAssets.entries()).map(([id, sizes]) => ({
        id,
        sizes,
        matched: false,
    }));
    for (const [assetId, oldAssetSizes] of oldAssets) {
        oldSizeTotal += oldAssetSizes.size;
        oldGzipSizeTotal += oldAssetSizes.gzipSize ?? Number.NaN;
        const matchingNewAsset = findMatchingAsset(newAssetEntries, assetId, oldAssetSizes);
        if (!matchingNewAsset) {
            removed.push(getAssetDiff(oldAssetSizes.name, oldAssetSizes, { size: 0, gzipSize: 0 }));
        }
        else {
            matchingNewAsset.matched = true;
            const diff = getAssetDiff(oldAssetSizes.name, oldAssetSizes, matchingNewAsset.sizes);
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
    for (const newAsset of newAssetEntries) {
        newSizeTotal += newAsset.sizes.size;
        newGzipSizeTotal += newAsset.sizes.gzipSize ?? Number.NaN;
        if (!newAsset.matched) {
            added.push(getAssetDiff(newAsset.sizes.name, { size: 0, gzipSize: 0 }, newAsset.sizes));
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
