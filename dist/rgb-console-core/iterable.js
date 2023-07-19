import { parsePrototype } from "./inner-attributes.js";
import { getCtorName } from "./object.js";
import { createToken } from "./token.js";
export function parseIterable(iterable) {
    const root = createToken('inst', 'object', getCtorName(iterable), iterable, null, []);
    for (const each of iterable) {
        root.children.push(createToken('item', typeof each, getCtorName(each), each, root, []));
    }
    return root;
}
export function parseEntries(objWithEntries) {
    const root = createToken('inst', 'object', getCtorName(objWithEntries), objWithEntries, null, []);
    for (const [k, v] of objWithEntries.entries()) {
        const entry = createToken('entry', 'virtual', '', null, root, [], false);
        entry.children.push(createToken('key', typeof k, getCtorName(k), k, entry, [], false), createToken('value', typeof v, getCtorName(v), v, entry, [], false));
        root.children.push(entry);
    }
    return root;
}
export function parseArray(arr) {
    const root = createToken('inst', 'object', getCtorName(arr), arr, null, []);
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        const item = arr[i];
        if (i in arr) {
            root.children.push(createToken('item', typeof item, getCtorName(item), item, root, []));
        }
        else {
            root.children.push(createToken('item', 'empty', '', null, root, []));
        }
    }
    const fLen = createToken('field', 'virtual', '', null, root, [], false);
    const kLen = createToken('key', 'string', 'String', 'length', fLen, [], false);
    const vLen = createToken('value', 'number', 'Number', len, fLen, [], false);
    fLen.children.push(kLen, vLen);
    root.children.push(fLen);
    parsePrototype(arr, root);
    return root;
}
function addSize(root, target) {
    const size = target.size;
    const fSize = createToken('field', 'virtual', '', null, root, [], false);
    const kSize = createToken('key', 'string', 'String', 'size', fSize, [], false);
    const vSize = createToken('value', typeof size, getCtorName(size), size, fSize, [], false);
    fSize.children.push(kSize, vSize);
    root.children.push(fSize);
    return root;
}
export function parseSet(collection) {
    const root = parseIterable(collection);
    parsePrototype(collection, root);
    return addSize(root, collection);
}
export function parseMap(map) {
    const root = parseEntries(map);
    parsePrototype(map, root);
    return addSize(root, map);
}
