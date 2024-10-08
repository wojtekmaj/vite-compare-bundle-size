import { printAssetTablesByGroup, printChunkModulesTable, printTotalAssetTable, } from './print-markdown.js';
export function getIdentifierComment(key) {
    return `<!--- bundlestats-action-comment${key ? ` key:${key}` : ''} --->`;
}
export function getCommentBody(statsDiff, chunkModuleDiff, title, describeAssetsOptions) {
    return `
### Bundle Stats${title ? ` — ${title}` : ''}

Hey there, this message comes from a [GitHub action](https://github.com/wojtekmaj/vite-compare-bundle-size) that helps you and reviewers to understand how these changes affect the size of this project's bundle.

As this PR is updated, I'll keep you updated on how the bundle size is impacted.

${printTotalAssetTable(statsDiff)}
${chunkModuleDiff ? `${printChunkModulesTable(chunkModuleDiff)}\n` : ''}
<details>
<summary>View detailed bundle breakdown</summary>

<div>

${printAssetTablesByGroup(statsDiff, describeAssetsOptions)}

</div>
</details>

${getIdentifierComment(title)}
`;
}
