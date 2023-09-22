function createToken(tokenType, basicType, ctorName, content, parent, children, enumerable = true) {
    return {
        tokenType, basicType, ctorName, parent, children, content, enumerable
    };
}

function innerAttrKeyVal(key, val, parent) {
    const fPair = createToken('inner', 'virtual', '', null, parent, [], false);
    fPair.children.push(createToken('key', 'string', 'String', `[[${key}]]`, fPair, [], false), createToken('value', typeof val, getCtorName(val), val, fPair, [], false));
    parent.children.push(fPair);
    return parent;
}
function parsePrototype(obj, parent) {
    const proto = Object.getPrototypeOf(obj);
    const tProto = innerAttrKeyVal('Prototype', proto, parent);
    return tProto;
}

function parseObject(obj) {
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
function getCtorName(obj) {
    if (obj === null || obj === undefined) {
        return 'empty';
    }
    const ctor = (Object.getPrototypeOf(obj) ?? Object.prototype).constructor;
    return ctor.name;
}
function getEnumerable(obj, p) {
    return Object.getOwnPropertyDescriptor(obj, p)?.enumerable;
}

function parseIterable(iterable) {
    const root = createToken('inst', 'object', getCtorName(iterable), iterable, null, []);
    for (const each of iterable) {
        root.children.push(createToken('item', typeof each, getCtorName(each), each, root, []));
    }
    return root;
}
function parseEntries(objWithEntries) {
    const root = createToken('inst', 'object', getCtorName(objWithEntries), objWithEntries, null, []);
    for (const [k, v] of objWithEntries.entries()) {
        const entry = createToken('entry', 'virtual', '', null, root, [], false);
        entry.children.push(createToken('key', typeof k, getCtorName(k), k, entry, [], false), createToken('value', typeof v, getCtorName(v), v, entry, [], false));
        root.children.push(entry);
    }
    return root;
}
function parseArray(arr) {
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
function parseSet(collection) {
    const root = parseIterable(collection);
    parsePrototype(collection, root);
    return addSize(root, collection);
}
function parseMap(map) {
    const root = parseEntries(map);
    parsePrototype(map, root);
    return addSize(root, map);
}

function parse(o) {
    if (typeof o !== 'object') {
        return createToken('primary', typeof o, getCtorName(o), o, null, []);
    }
    if (o instanceof Array) {
        return parseArray(o);
    }
    if (o instanceof Set) {
        return parseSet(o);
    }
    if (o instanceof Map) {
        return parseMap(o);
    }
    return safeParse(o);
}
function safeParse(obj) {
    try {
        if (typeof obj.entries === 'function') {
            return parseEntries(obj);
        }
        else
            throw Error();
    }
    catch (_) {
        try {
            if (typeof obj[Symbol.iterator] === 'function') {
                return parseIterable(obj);
            }
            else
                throw Error();
        }
        catch (error) {
            return parseObject(obj);
        }
    }
}

export { createToken, getCtorName, getEnumerable, parse, parseObject };
