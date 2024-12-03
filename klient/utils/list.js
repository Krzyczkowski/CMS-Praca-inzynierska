// functions for arrays

export function extractValuesFromKey(array, key) {
    return array.map(item => item[key]);
}