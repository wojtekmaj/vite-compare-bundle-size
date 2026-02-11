import type { SizesWithName, SourceGroup, StatsAsset, StatsGroup } from './types.js';

type StatEntry = [label: string, SizesWithName];

function formatLabel(label: string): string {
  return label.replace(/-[a-zA-Z0-9_-]{8}(?=\.[^.]+$)/, '-[hash]');
}

function formatId(asset: StatsAsset | SourceGroup, stats?: StatsGroup | null): string {
  const sourceOrGroups = 'source' in asset ? asset.source : 'groups' in asset ? asset.groups : null;
  // v0 has 'stats' aside from 'source' and 'stats' had better labels
  const assetStats = 'stats' in asset ? asset.stats : null;

  return sourceOrGroups?.length
    ? sourceOrGroups
        .map((sourceOrGroup) => {
          const assetStatsWithMatchingLabel = assetStats
            ? assetStats.find((s) => sourceOrGroup.label.endsWith(s.label))
            : null;

          return formatId(sourceOrGroup, assetStatsWithMatchingLabel);
        })
        .sort()
        .join('|')
    : formatLabel(stats ? stats.label : asset.label);
}

function collectStatsInGroup(group: SourceGroup): StatEntry[] {
  // If a module doesn't have any submodules beneath it, then just return its own size
  // Otherwise, break each module into its submodules with their own sizes
  if (!group.groups) {
    return [
      [
        formatId(group),
        {
          name: formatLabel(group.label),
          originalName: group.label,
          size: group.parsedSize ?? 0,
          gzipSize: group.gzipSize ?? 0,
        },
      ],
    ];
  }

  return group.groups.flatMap((subgroup: SourceGroup) => collectStatsInGroup(subgroup)) ?? [];
}

export function assetNameToSizeMap(statAssets: StatsAsset[] = []): Map<string, SizesWithName> {
  const result = new Map(
    statAssets.map((asset) => [
      formatId(asset),
      {
        name: formatLabel(asset.label),
        originalName: asset.label,
        size: asset.parsedSize,
        gzipSize: asset.gzipSize,
      },
    ]),
  );

  return result;
}

export function chunkModuleNameToSizeMap(
  statsAssets: StatsAsset[] = [],
): Map<string, SizesWithName> {
  return new Map(
    statsAssets.flatMap((asset) => {
      if (!asset.source) {
        return [];
      }

      return asset.source.flatMap((source: SourceGroup) => collectStatsInGroup(source));
    }),
  );
}
