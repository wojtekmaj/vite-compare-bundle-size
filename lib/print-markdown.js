import { formatFileSizeIEC } from './file-sizes.js';
function conditionalPercentage(number) {
    if ([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].includes(number)) {
        return '-';
    }
    const absValue = Math.abs(number);
    if ([0, 100].includes(absValue)) {
        return `${number}%`;
    }
    const value = [0, 100].includes(absValue) ? absValue : absValue.toFixed(2);
    return `${signFor(number)}${value}%`;
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function makeHeader(columns) {
    return `${columns.join(' | ')}
${columns
        .map((x) => Array.from(new Array(x.length))
        .map(() => '-')
        .join(''))
        .join(' | ')}`;
}
const TOTAL_HEADERS = makeHeader(['Files count', 'Total bundle size', '% Changed']);
const TABLE_HEADERS = makeHeader(['Asset', 'File Size', '% Changed']);
function signFor(num) {
    if (num === 0)
        return '';
    return num > 0 ? '+' : '-';
}
function toFileSizeDiff(oldSize, newSize, diff) {
    const diffLine = [`${formatFileSizeIEC(oldSize)} → ${formatFileSizeIEC(newSize)}`];
    if (typeof diff !== 'undefined') {
        diffLine.push(`(${signFor(diff)}${formatFileSizeIEC(diff)})`);
    }
    return diffLine.join(' ');
}
function toFileSizeDiffCell(asset) {
    const lines = [];
    if (asset.diff === 0) {
        lines.push(formatFileSizeIEC(asset.new.size));
        if (asset.new.gzipSize) {
            lines.push(formatFileSizeIEC(asset.new.gzipSize));
        }
    }
    else {
        lines.push(toFileSizeDiff(asset.old.size, asset.new.size, asset.diff));
        if (asset.old.gzipSize || asset.new.gzipSize) {
            lines.push(`${toFileSizeDiff(asset.old.gzipSize, asset.new.gzipSize)} (gzip)`);
        }
    }
    return lines.join('<br />');
}
function printAssetTableRow(asset) {
    return [asset.name, toFileSizeDiffCell(asset), conditionalPercentage(asset.diffPercentage)].join(' | ');
}
export function printAssetTablesByGroup(statsDiff, describeAssetsOptions = {
    added: true,
    removed: true,
    bigger: true,
    smaller: true,
    unchanged: true,
}) {
    const statsFields = Object.keys(describeAssetsOptions).filter((field) => describeAssetsOptions[field]);
    return statsFields
        .map((field) => {
        const assets = statsDiff[field];
        if (assets.length === 0) {
            return `**${capitalize(field)}**

No assets were ${field}`;
        }
        return `**${capitalize(field)}**

${TABLE_HEADERS}
${assets
            .map((asset) => {
            return printAssetTableRow(asset);
        })
            .join('\n')}`;
    })
        .join('\n\n');
}
const getDiffEmoji = (diff) => diff.diffPercentage === Number.POSITIVE_INFINITY
    ? '🆕'
    : diff.diffPercentage <= -100
        ? '🔥'
        : diff.diffPercentage > 0
            ? '📈'
            : diff.diffPercentage < 0
                ? '📉'
                : ' ';
const getTrimmedChunkName = (chunkModule) => {
    let chunkName = chunkModule.name;
    if (chunkName.startsWith('./')) {
        chunkName = chunkName.substring(2);
    }
    else if (chunkName.startsWith('/')) {
        chunkName = chunkName.substring(1);
    }
    return chunkName;
};
const CHUNK_TABLE_HEADERS = makeHeader(['File', 'Δ', 'Size']);
function printChunkModuleRow(chunkModule) {
    const emoji = getDiffEmoji(chunkModule);
    const chunkName = getTrimmedChunkName(chunkModule);
    return [
        `\`${chunkName}\``,
        `${emoji} ${chunkModule.diff >= 0 ? '+' : '-'}${formatFileSizeIEC(chunkModule.diff)}${Number.isFinite(chunkModule.diffPercentage)
            ? ` (${conditionalPercentage(chunkModule.diffPercentage)})`
            : ''}`,
        `${formatFileSizeIEC(chunkModule.old.size)} → ${formatFileSizeIEC(chunkModule.new.size)}`,
    ].join(' | ');
}
export function printChunkModulesTable(statsDiff) {
    if (!statsDiff)
        return '';
    const changedModules = [
        ...statsDiff.added,
        ...statsDiff.removed,
        ...statsDiff.bigger,
        ...statsDiff.smaller,
    ].sort((a, b) => b.diffPercentage - a.diffPercentage);
    if (changedModules.length === 0) {
        return `
Changeset

No files were changed`;
    }
    return `
<details>
<summary>Changeset${changedModules.length > 100 ? ' (largest 100 files by percent change)' : ''}</summary>

${CHUNK_TABLE_HEADERS}
${changedModules
        .slice(0, 100)
        .map((chunkModule) => printChunkModuleRow(chunkModule))
        .join('\n')}

</details>
`;
}
export function printTotalAssetTable(statsDiff) {
    return `**Total**

${TOTAL_HEADERS}
${printAssetTableRow(statsDiff.total)}`;
}
