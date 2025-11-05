export type Sizes = {
  size: number;
  gzipSize: number | null;
};

export type SizesWithName = Sizes & {
  name: string;
  originalName: string;
};

export type AssetDiff = {
  name: string;
  new: Sizes;
  old: Sizes;
  diff: number;
  diffPercentage: number;
};

export type ViteStatsDiff = {
  added: AssetDiff[];
  removed: AssetDiff[];
  bigger: AssetDiff[];
  smaller: AssetDiff[];
  unchanged: AssetDiff[];
  total: AssetDiff;
};

export const describeAssetsSections = [
  'added',
  'removed',
  'bigger',
  'smaller',
  'unchanged',
] as const;

export type DescribeAssetsSection = (typeof describeAssetsSections)[number];

export type DescribeAssetsOptions = { [S in DescribeAssetsSection]: boolean };

export type StatsGroup = {
  statSize: number;
  label: string;
  groups?: StatsGroup[];
};

export type StatsAsset = {
  filename: string;
  label: string;
  parsedSize: number;
  statSize: number;
  gzipSize: number;
  stats?: StatsGroup[];
};

export const isDescribeAssetsSection = (option: string): option is DescribeAssetsSection => {
  return describeAssetsSections.includes(option as DescribeAssetsSection);
};
