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
export declare const describeAssetsSections: readonly ["added", "removed", "bigger", "smaller", "unchanged"];
export type DescribeAssetsSection = (typeof describeAssetsSections)[number];
export type DescribeAssetsOptions = {
    [S in DescribeAssetsSection]: boolean;
};
export type SourceGroup = {
    gzipSize: number;
    parsedSize: number;
    brotliSize?: number;
    label: string;
    groups?: SourceGroup[];
};
export type StatsGroup = {
    label: string;
    groups?: StatsGroup[];
};
export type StatsAsset = {
    filename: string;
    label: string;
    parsedSize: number;
    gzipSize: number;
    brotliSize?: number;
    source?: SourceGroup[];
    stats?: StatsGroup[];
};
export declare const isDescribeAssetsSection: (option: string) => option is DescribeAssetsSection;
