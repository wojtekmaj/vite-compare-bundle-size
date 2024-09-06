import type { DescribeAssetsOptions, ViteStatsDiff } from './types.js';
export declare function printAssetTablesByGroup(statsDiff: Omit<ViteStatsDiff, 'total'>, describeAssetsOptions?: DescribeAssetsOptions): string;
export declare function printChunkModulesTable(statsDiff: Omit<ViteStatsDiff, 'total' | 'unchanged'> | null): string;
export declare function printTotalAssetTable(statsDiff: Pick<ViteStatsDiff, 'total'>): string;
