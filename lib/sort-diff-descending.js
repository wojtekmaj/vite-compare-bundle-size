export function sortDiffDescending(items) {
    return items.sort((diff1, diff2) => Math.abs(diff2.diff) - Math.abs(diff1.diff));
}
