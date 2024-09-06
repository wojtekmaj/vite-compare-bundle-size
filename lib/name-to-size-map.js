function formatLabel(label) {
    return label.replace(/-[a-zA-Z0-9_]{8}\./, '-[hash].');
}
function formatId(asset) {
    const statsOrGroups = 'stats' in asset ? asset.stats : 'groups' in asset ? asset.groups : null;
    return statsOrGroups && statsOrGroups.length > 0
        ? statsOrGroups
            .map((statOrGroup) => formatId(statOrGroup))
            .sort()
            .join('|')
        : formatLabel(asset.label);
}
function collectStatsInGroup(group) {
    // If a module doesn't have any submodules beneath it, then just return its own size
    // Otherwise, break each module into its submodules with their own sizes
    if (!group.groups) {
        return [
            [
                formatId(group),
                {
                    name: formatLabel(group.label),
                    size: group.statSize ?? 0,
                    gzipSize: null,
                },
            ],
        ];
    }
    return group.groups.flatMap((subgroup) => collectStatsInGroup(subgroup)) ?? [];
}
export function assetNameToSizeMap(statAssets = []) {
    const result = new Map(statAssets.map((asset) => [
        formatId(asset),
        {
            name: formatLabel(asset.label),
            size: asset.parsedSize,
            gzipSize: asset.gzipSize,
        },
    ]));
    return result;
}
export function chunkModuleNameToSizeMap(statsAssets = []) {
    return new Map(statsAssets.flatMap((asset) => {
        if (!asset.stats) {
            return [];
        }
        return asset.stats.flatMap((stat) => collectStatsInGroup(stat));
    }));
}
