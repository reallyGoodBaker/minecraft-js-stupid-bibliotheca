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

class Printer {
    #out = null;
    print(obj) {
        const data = parse(obj);
        const root = createToken('inst', 'virtual', '', null, null, [data]);
        let str = '';
        const handler = (t) => {
            if (t.tokenType === 'inst') {
                str += `${t.ctorName}\n`;
                this.traverse(t, handler);
            }
            if (t.tokenType === 'field' || t.tokenType === 'inner') {
                const k = t.children.find(v => v.tokenType === 'key');
                const v = t.children.find(v => v.tokenType === 'value');
                str += `${this.previewKey(k?.content)}: ${this.preview(v?.content)}\n`;
            }
            if (t.tokenType === 'primary') {
                str += t.content.toString();
            }
            if (t.tokenType === 'item') {
                str += (t.basicType === 'empty' ? 'empty' : t.content) + ', ';
            }
            if (t.tokenType === 'entry') {
                const k = t.children.find(v => v.tokenType === 'key');
                const v = t.children.find(v => v.tokenType === 'value');
                str += `${this.previewKey(k?.content, true)} => ${this.preview(v?.content)}\n`;
            }
            if (t.tokenType === 'accessor') {
                this.traverse(t, handler);
            }
            if (t.tokenType === 'getter' || t.tokenType === 'setter') {
                let name = t.content.name;
                if (name === 'get' && t.parent) {
                    const key = t.parent.children.find(v => v.tokenType === 'key');
                    name = 'get ' + key?.content.toString();
                }
                str += `${name ?? 'anonymous'}()\n`;
            }
        };
        this.traverse(root, handler);
        this.#out?.write(str);
    }
    traverse(parent, handler) {
        for (const t of parent.children) {
            handler.call(null, t);
        }
    }
    previewKey(obj, fullTypesRefer = false) {
        if (['string', 'number', 'symbol'].includes(typeof obj)) {
            return obj.toString();
        }
        if ('size' in obj || 'length' in obj) {
            return getCtorName(obj) + `(${obj.size ?? obj.length})`;
        }
        return getCtorName(obj);
    }
    preview(obj) {
        if (typeof obj === 'string') {
            return `'${obj}'`;
        }
        if (['number', 'boolean', 'bigint', 'function', 'symbol'].includes(typeof obj)) {
            return obj.toString();
        }
        if (typeof obj.length === 'number') {
            return `${getCtorName(obj)}(${obj.length})`;
        }
        if (typeof obj.constructor === 'function') {
            return obj.constructor.name;
        }
        if (obj.size) {
            return `${getCtorName(obj)}(${obj.size})`;
        }
        if (typeof obj === 'object') {
            return `${getCtorName(obj)} {...}`;
        }
        return obj.toString();
    }
    constructor(outStream) {
        if (outStream) {
            this.#out = outStream;
        }
        if ('console' in globalThis) {
            this.#out = {
                write(msg) {
                    //@ts-ignore
                    globalThis.console.log(msg);
                },
            };
        }
    }
}

const printer = new Printer();
const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
};
let sym = Symbol('sym');
const obj2 = {
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return true; },
    get b() { return Math.random(); },
    [sym]: () => 1
};
Object.defineProperty(obj2, sym, {
    get() {
        return '?';
    }
});
const arr = [1, 2, 3, , 4];
const s = new Set(arr);
const map = new Map();
map.set('foo', 'bar');
map.set(s, 'cool');
map.set('s', s);
printer.print(1);
printer.print('wow');
printer.print(obj1);
printer.print(obj2);
printer.print(arr);
printer.print(s);
printer.print(map);
// console.log(map)
