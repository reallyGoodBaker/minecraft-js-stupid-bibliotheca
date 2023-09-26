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

var FormattingTypes;
(function (FormattingTypes) {
    FormattingTypes[FormattingTypes["MINECRAFT"] = 0] = "MINECRAFT";
    FormattingTypes[FormattingTypes["ESCAPE_SEQ"] = 1] = "ESCAPE_SEQ";
})(FormattingTypes || (FormattingTypes = {}));
const Formatting = {
    black: "§0",
    dark_blue: "§1",
    dark_green: "§2",
    dark_aqua: "§3",
    dark_red: "§4",
    dark_purple: "§5",
    gold: "§6",
    gray: "§7",
    dark_gray: "§8",
    blue: "§9",
    green: "§a",
    aqua: "§b",
    red: "§c",
    light_purple: "§d",
    yellow: "§e",
    white: "§f",
    minecoin_gold: "§g",
    obfuscated: "§k",
    bold: "§l",
    italic: "§o",
    reset: "§r",
};
const FormattingANSLEscapeSequences = {
    black: "\x1b[30m",
    dark_blue: "\x1b[34m",
    dark_green: "\x1b[32m",
    dark_aqua: "\x1b[36m",
    dark_red: "\x1b[31m",
    dark_purple: "\x1b[35m",
    dark_gray: "\x1b[90m",
    gold: "\x1b[93m",
    gray: "\x1b[37m",
    blue: "\x1b[94m",
    green: "\x1b[92m",
    aqua: "\x1b[96m",
    red: "\x1b[91m",
    light_purple: "\x1b[95m",
    yellow: "\x1b[33m",
    white: "\x1b[97m",
    minecoin_gold: "\x1b[93m",
    obfuscated: "\x1b[7m",
    bold: "\x1b[1m",
    italic: "\x1b[3m",
    reset: "\x1b[0m",
};
function style(key, format = FormattingTypes.ESCAPE_SEQ) {
    return format === FormattingTypes.MINECRAFT ? Formatting[key]
        : FormattingANSLEscapeSequences[key];
}

var Basic;
(function (Basic) {
    Basic["undefined"] = "dark_blue";
    Basic["boolean"] = "dark_blue";
    Basic["function"] = "yellow";
    Basic["number"] = "aqua";
    Basic["string"] = "light_purple";
    Basic["symbol"] = "minecoin_gold";
    Basic["cls"] = "minecoin_gold";
    Basic["keywords"] = "minecoin_gold";
    Basic["raw"] = "white";
})(Basic || (Basic = {}));
var ObjectProp;
(function (ObjectProp) {
    ObjectProp["setterGetter"] = "dark_green";
    ObjectProp["innenumerable"] = "green";
    ObjectProp["preview"] = "gray";
    ObjectProp["normal"] = "blue";
    ObjectProp["prototype"] = "dark_gray";
    ObjectProp["symbol"] = "minecoin_gold";
})(ObjectProp || (ObjectProp = {}));
var TextStyle;
(function (TextStyle) {
    TextStyle["bold"] = "bold";
    TextStyle["italic"] = "italic";
    TextStyle["reset"] = "reset";
    TextStyle["obfuscated"] = "obfuscated";
})(TextStyle || (TextStyle = {}));

class StyledMessage {
    #style = [];
    #message = [];
    #type;
    constructor(formatting = FormattingTypes.ESCAPE_SEQ) {
        this.setFormattingTypes(formatting);
    }
    setFormattingTypes(type) {
        this.#type = type;
    }
    #s(s) {
        return style(s, this.#type);
    }
    addStyle(style) {
        const styleStr = this.#s(style);
        this.#style.push(styleStr);
        this.#message.push(styleStr);
        return this;
    }
    popStyle(count = 1) {
        const styleStack = this.#style;
        for (let i = 0; i < count; i++) {
            styleStack.pop();
        }
        if (!styleStack.length) {
            this.#message.push(this.#s(Basic.raw));
            return this;
        }
        const currentStyle = styleStack[styleStack.length - 1];
        this.#message.push(currentStyle);
        return this;
    }
    addText(t) {
        this.#message.push(t);
        return this;
    }
    addBlock(txt, styles) {
        const size = styles.length;
        for (const style of styles) {
            this.addStyle(style);
        }
        this.addText(txt);
        this.popStyle(size);
        return this;
    }
    toString() {
        return this.#message.join('');
    }
}

function genKey(k, fullTypes = false, format = FormattingTypes.ESCAPE_SEQ) {
    let message = new StyledMessage(format);
    if (fullTypes) {
        if (typeof k === 'object' && ('size' in k || 'length' in k)) {
            return message
                .addStyle(ObjectProp.normal)
                .addText(getCtorName(k) + '(')
                .addBlock(k.size ?? k.length, [Basic.number])
                .addText(')')
                .toString();
        }
        return message
            .addText(genPreview(k, format))
            .toString();
    }
    if (typeof k === 'symbol') {
        message.addStyle(ObjectProp.symbol);
    }
    else {
        message.addStyle(ObjectProp.normal);
    }
    message.addText(k.toString());
    return message.toString();
}
function genGeneric(obj, format = FormattingTypes.ESCAPE_SEQ) {
    let message = new StyledMessage(format);
    switch (typeof obj) {
        case 'bigint':
        case 'number':
            return message
                .addBlock(obj.toString(), [Basic.number])
                .toString();
        case 'boolean':
        case 'undefined':
            return message
                .addBlock(`${obj}`, [Basic.undefined])
                .toString();
        case 'string':
            return message
                .addBlock(`'${obj}'`, [Basic.string])
                .toString();
        case 'symbol':
            return message
                .addBlock(obj.toString(), [Basic.symbol])
                .toString();
        default:
            return '';
    }
}
function getFuncSign(func) {
    let fstr = func.toString();
    let anonymous = true;
    let asyncSign = fstr.startsWith('async');
    if (asyncSign) {
        fstr = fstr.slice(5).trim();
    }
    if (func.name) {
        const end = fstr.indexOf(')');
        anonymous = false;
        fstr = fstr.slice(8, end + 1)
            .trim();
    }
    return {
        async: asyncSign,
        sign: fstr,
        anonymous,
    };
}
function genFuncPreview(func, format = FormattingTypes.ESCAPE_SEQ) {
    const { async: isAsync, sign: funcSign, anonymous, } = getFuncSign(func);
    let message = new StyledMessage(format);
    if (isAsync) {
        message.addBlock('async ', [Basic.function]);
    }
    if (!anonymous) {
        message.addBlock('f ', [Basic.function]);
    }
    message.addText(funcSign);
    return message.toString();
}
function genComplexPreview(o, format = FormattingTypes.ESCAPE_SEQ) {
    const ctorName = getCtorName(o);
    const message = new StyledMessage(format);
    if (ctorName === 'Object') {
        const preview = Reflect.ownKeys(o).length ? '{...}' : '{}';
        return message
            .addText(preview)
            .toString();
    }
    if (ctorName === 'Array') {
        if (o.length > 0) {
            return message
                .addStyle(Basic.raw)
                .addText('[...')
                .addBlock(o.length, [Basic.number])
                .addText(']')
                .toString();
        }
        return message
            .addBlock('[]', [Basic.raw])
            .toString();
    }
    if ('size' in o || 'length' in o) {
        return message
            .addStyle(Basic.raw)
            .addText(getCtorName(o) + '(')
            .addBlock(o.size ?? o.length, [Basic.number])
            .addText(')')
            .toString();
    }
    return message
        .addBlock(getCtorName(o), [Basic.raw])
        .toString();
}
function genPreview(o, format = FormattingTypes.ESCAPE_SEQ) {
    const objType = typeof o;
    if (objType === 'function') {
        return genFuncPreview(o, format);
    }
    if (objType === 'object') {
        return o ? genComplexPreview(o, format)
            : new StyledMessage(format)
                .addBlock('null', [Basic.undefined])
                .toString();
    }
    return genGeneric(o, format);
}
function genPartialArrayLike(arr, maxItemCount = 10, format = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format);
    const arrCtorName = getCtorName(arr);
    const isArray = arrCtorName === 'Array';
    message
        .addStyle(Basic.raw)
        .addText((isArray ? '' : arrCtorName) + '(')
        .addBlock(arr.length.toString(), [Basic.number])
        .addText(`) ${isArray ? '[' : '{'}`);
    for (let count = 0; count < arr.length; count++) {
        const item = arr[count];
        if (count === maxItemCount) {
            message.addText(', ...');
            break;
        }
        if (count) {
            message.addBlock(', ', [Basic.raw]);
        }
        if (count in arr) {
            message.addText(genPreview(item, format));
        }
        else {
            message.addBlock('empty', [ObjectProp.prototype]);
        }
    }
    return message
        .addText(isArray ? ']' : '}')
        .toString();
}
function genPartialIterable(it, maxItemCount = 10, format = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format);
    let count = 0;
    message
        .addStyle(Basic.raw)
        .addText(getCtorName(it) + ' {');
    for (const item of it) {
        if (count === maxItemCount) {
            message.addText(', ...');
            break;
        }
        if (count) {
            message.addBlock(', ', [Basic.raw]);
        }
        count++;
        message.addText(genPreview(item, format));
    }
    return message
        .addText('}')
        .toString();
}
function genPartialEntries(e, maxItemCount = 10, format = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format);
    let count = 0;
    message
        .addStyle(Basic.raw)
        .addText(getCtorName(e) + ' {');
    for (const [k, v] of e.entries()) {
        if (count === maxItemCount) {
            message.addText(', ...');
            break;
        }
        if (count) {
            message.addBlock(', ', [Basic.raw]);
        }
        message
            .addText(genKey(k, true, format))
            .addBlock(' => ', [Basic.raw])
            .addText(genPreview(v, format));
        count++;
    }
    return message
        .addText('}')
        .toString();
}
function genPartialObject(o, maxItemCount = 10, format = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format);
    let count = 0;
    message
        .addStyle(Basic.raw)
        .addText(getCtorName(o) + ' {');
    for (const [k, v] of Object.entries(o)) {
        if (count === maxItemCount) {
            message.addText(', ...');
            break;
        }
        if (count) {
            message.addBlock(', ', [Basic.raw]);
        }
        message
            .addText(genKey(k, false, format))
            .addBlock(': ', [Basic.raw])
            .addText(genPreview(v, format));
        count++;
    }
    return message
        .addText('}')
        .toString();
}
function genPartial(o, maxItemCount = 10, format = FormattingTypes.ESCAPE_SEQ) {
    if (typeof o === 'object') {
        if (typeof o.length === 'number') {
            return genPartialArrayLike(o, maxItemCount, format);
        }
        if (typeof o[Symbol.iterator] === 'function' &&
            !(o instanceof Map)) {
            return genPartialIterable(o, maxItemCount, format);
        }
        if (typeof o.entries === 'function') {
            return genPartialEntries(o, maxItemCount, format);
        }
        if (o !== null) {
            return genPartialObject(o, maxItemCount, format);
        }
    }
    return genPreview(o, format);
}

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
};
let set = new Set([1, , 2, 3, 4, 'foo', 'bar']);
let sym = Symbol('sym');
parse({
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return set; },
    get b() { return Math.random(); },
    [sym]: () => 1,
});
// console.log(genFuncPreview(async function foo() {}))
// console.log(getFuncSign(async () => {}))
// console.log(genKey(tokens.content, true))
// console.log(
//     genComplexPreview([ 1, 2, 3 ]),
//     genComplexPreview({}),
//     genComplexPreview(obj1)
// )
// console.log(
//     genComplexPreview(set),
// )
const map = new Map()
    .set(obj1, 'cool')
    .set('ok', set)
    .set(set, obj1);
// ;[
//     genPreview(async function foo() {}),
//     genPreview(async () => {}),
//     genPreview([ 1, 2, 3 ]),
//     genPreview({}),
//     genPreview(set),
//     genPreview(obj1),
//     genPreview('hello world!'),
//     genPreview(Symbol('symbol')),
//     genPartialIterable([ 1, 1, 4, 5, 1, , 4 ]),
//     genPartialArrayLike([ 1, 1, 4, 5, 1, , 4 ]),
//     genPartialEntries(map),
//     genPartialEntries(set),
// ].forEach(el => {
//     console.log(el)
// })
console.log(parse([
    1, [2, 3], 3, , 5,
]));
[
    genPartial(async function foo() { }),
    genPartial(async () => { }),
    genPartial([1, 2, 3]),
    genPartial({}),
    genPartial(set),
    genPartial(obj1),
    genPartial('hello world!'),
    genPartial(Symbol('symbol')),
    genPartial([1, 1, 4, 5, 1, , 4]),
    genPartial(map),
    genPartial(set),
].forEach(el => {
    console.log(el);
});
