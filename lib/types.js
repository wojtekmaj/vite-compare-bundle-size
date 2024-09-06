export const describeAssetsSections = [
    'added',
    'removed',
    'bigger',
    'smaller',
    'unchanged',
];
export const isDescribeAssetsSection = (option) => {
    return describeAssetsSections.includes(option);
};
