import { getCtorName } from "./object.js";
import { createToken } from "./token.js";
export function parseIterable(iterable) {
    const root = createToken('inst', 'object', getCtorName(iterable), iterable, null, []);
    for (const each of iterable) {
        root.children.push(createToken('item', typeof each, getCtorName(each), each, root, []));
    }
    return root;
}
export function parseArray(arr) {
    const root = parseIterable(arr);
    const len = arr.length;
    const fLen = createToken('field', 'virtual', '', null, root, []);
    const kLen = createToken('key', 'string', 'String', 'length', fLen, []);
    const vLen = createToken('value', 'number', 'Number', len, fLen, []);
    fLen.children.push(kLen, fLen);
    root.children.push(fLen);
    return root;
}
