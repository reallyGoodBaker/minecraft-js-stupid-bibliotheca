import { parsePrototype } from './inner-attributes.js';
import { createToken } from './token.js';
export function parseObject(obj) {
    const root = createToken('inst', 'object', getCtorName(obj), obj, null, []);
    const descs = Reflect.ownKeys(obj).map(k => [k, Object.getOwnPropertyDescriptor(obj, k)]);
    for (const [k, desc] of descs) {
        if (!desc) {
            continue;
        }
        const { value: v, set, get, enumerable } = desc;
        if (v !== undefined) {
            const tField = createToken('field', 'virtual', '', null, root, []);
            const tKey = createToken('key', typeof k, getCtorName(k), k, tField, []);
            const tVal = createToken('value', typeof v, getCtorName(v), v, tField, []);
            tField.children.push(tKey, tVal);
            root.children.push(tField);
            continue;
        }
        const tAccessor = createToken('accessor', 'virtual', '', null, root, [], enumerable);
        tAccessor.children.push(createToken('key', typeof k, getCtorName(k), k, tAccessor, []));
        if (typeof get === 'function') {
            tAccessor.children.push(createToken('getter', 'function', getCtorName(get), get, tAccessor, []));
        }
        if (typeof set === 'function') {
            tAccessor.children.push(createToken('setter', 'function', getCtorName(set), set, tAccessor, []));
        }
        root.children.push(tAccessor);
    }
    parsePrototype(obj, root);
    return root;
}
export function getCtorName(obj) {
    if (obj === null || obj === undefined) {
        return 'empty';
    }
    const ctor = (Object.getPrototypeOf(obj) ?? Object.prototype).constructor;
    return ctor.name;
}
export function getEnumerable(obj, p) {
    return Object.getOwnPropertyDescriptor(obj, p)?.enumerable;
}
