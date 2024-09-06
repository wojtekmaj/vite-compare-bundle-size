import type { ViteStatsDiff, DescribeAssetsOptions } from './types.js';
export declare function getIdentifierComment(key: string): string;
export declare function getCommentBody(statsDiff: ViteStatsDiff, chunkModuleDiff: ViteStatsDiff | null, title: string, describeAssetsOptions: DescribeAssetsOptions): string;
