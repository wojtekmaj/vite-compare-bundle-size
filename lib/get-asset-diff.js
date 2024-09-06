export function getAssetDiff(name, oldSize, newSize) {
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
