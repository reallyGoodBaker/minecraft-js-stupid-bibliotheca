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
    normal: ''
};

class Linked {
    static map = new Map();
    HEAD = {
        prev: null,
        next: null
    };
    END = this.HEAD;
    count = 0;
    append(listener, rawListener) {
        const prev = this.END;
        const cur = {
            prev, listener, rawListener, next: null,
        };
        cur.prev = prev;
        cur.listener = listener;
        cur.rawListener = rawListener;
        cur.next = null;
        prev.next = cur;
        this.END = cur;
        Linked.map.set(rawListener || listener, cur);
        this.count++;
        return this;
    }
    prepend(listener, rawListener) {
        const prev = this.HEAD;
        const next = prev.next;
        const cur = {
            prev, listener, rawListener, next
        };
        prev.next = cur;
        if (next) {
            next.prev = cur;
        }
        Linked.map.set(rawListener || listener, cur);
        this.count++;
        return this;
    }
    delete(rawListener) {
        let map = Linked.map, cur = map.get(rawListener);
        if (!cur) {
            return;
        }
        let pre = cur.prev;
        pre.next = cur.next;
        if (cur.next) {
            cur.next.prev = pre;
        }
        map.delete(rawListener);
        this.count--;
        requestIdleCallback(() => {
            cur.prev = null;
            cur.next = null;
        });
        return this;
    }
    deleteAll() {
        let node = this.HEAD;
        while (node = node.next) {
            node.prev = null;
            node.next = null;
            Linked.map.delete(node.rawListener || node.listener);
        }
        this.HEAD.next = null;
        this.count = 0;
        return this;
    }
    [Symbol.iterator]() {
        let ptr = this.HEAD;
        return {
            next() {
                if (ptr.next) {
                    ptr = ptr.next;
                }
                else {
                    return {
                        value: ptr,
                        done: true,
                    };
                }
                return {
                    value: ptr,
                    done: false
                };
            }
        };
    }
}
class EventEmitter {
    /**@private*/
    _events = {};
    maxListeners = -1;
    thisArg = undefined;
    captureRejections = false;
    setMaxListeners(size) {
        this.maxListeners = size;
        return this;
    }
    getMaxListeners() {
        return this.maxListeners;
    }
    /**@private*/
    _addListener(type, handler, prepend = false) {
        let ev;
        if (!~this.maxListeners && this.listenerCount(type) === this.maxListeners) {
            const err = RangeError(`Exceeded maximum capacity(${this.maxListeners}).`);
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
        if (!this._events[type])
            this._events[type] = new Linked();
        ev = this._events[type];
        if (prepend) {
            ev.prepend(handler);
        }
        else {
            ev.append(handler);
        }
    }
    addListener(type, handler) {
        this._addListener(type, handler);
        return this;
    }
    on(type, handler) {
        this._addListener(type, handler);
        return this;
    }
    prependListener(type, handler) {
        this._addListener(type, handler, true);
        return this;
    }
    /**@private*/
    _removeListener(type, handler) {
        let ev;
        if (ev = this._events[type]) {
            ev.delete(handler);
            if (!ev.count) {
                delete this._events[type];
            }
        }
    }
    removeListener(type, handler) {
        this._removeListener(type, handler);
        return this;
    }
    off(type, handler) {
        this._removeListener(type, handler);
        return this;
    }
    removeAllListeners(type) {
        let ev;
        if (ev = this._events[type]) {
            ev.deleteAll();
            delete this._events[type];
        }
    }
    /**@private*/
    _emit(type, thisArg, args) {
        let ev;
        if (ev = this._events[type], !ev) {
            return;
        }
        try {
            let captureRejections = this.captureRejections, node = ev.HEAD;
            while (node = node.next) {
                const returnVal = node.listener.apply(thisArg, args);
                if (captureRejections && returnVal instanceof Promise) {
                    returnVal.catch((err) => {
                        if (this.listenerCount('error')) {
                            this._emitError(err);
                        }
                        else {
                            throw err;
                        }
                    });
                }
            }
        }
        catch (err) {
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
    }
    /**@private*/
    _emitError(err) {
        this._emit('error', undefined, [err]);
    }
    emit(type, ...args) {
        this._emit(type, this.thisArg, args);
    }
    emitNone(type, ...args) {
        this._emit(type, undefined, args);
    }
    bind(thisArg) {
        this.thisArg = thisArg;
        return this;
    }
    /**@private*/
    _onceWrapper(type, handler) {
        return (...args) => {
            this._removeListener(type, handler);
            const val = handler.apply(this.thisArg, args);
            return val;
        };
    }
    /**@private*/
    _once(type, handler, prepend = false) {
        if (!~this.maxListeners && this.listenerCount(type) === this.maxListeners) {
            const err = RangeError(`Exceeded maximum capacity(${this.maxListeners}).`);
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
        const listener = this._onceWrapper(type, handler);
        let ev;
        if (!this._events[type])
            this._events[type] = new Linked();
        ev = this._events[type];
        if (prepend) {
            ev.prepend(listener, handler);
        }
        else {
            ev.append(listener, handler);
        }
    }
    once(type, handler) {
        this._once(type, handler);
        return this;
    }
    prependOnceListener(type, handler) {
        this._once(type, handler, true);
        return this;
    }
    listenerCount(type) {
        let ev;
        if (ev = this._events[type], !ev) {
            return 0;
        }
        return ev.count;
    }
    listeners(type) {
        let ev;
        let res = [];
        if (ev = this._events[type], !ev) {
            return res;
        }
        let node = ev.HEAD;
        while (node = node.next) {
            res.push(node.listener);
        }
        return res;
    }
    rawListeners(type) {
        let ev;
        let res = [];
        if (ev = this._events[type], !ev) {
            return res;
        }
        let node = ev.HEAD;
        while (node = node.next) {
            if (node.rawListener) {
                res.push(node.rawListener);
            }
        }
        return res;
    }
    eventNames() {
        return Object.getOwnPropertyNames(this._events);
    }
    constructor(opt) {
        if (opt) {
            const { thisArg, captureRejections } = opt;
            if (typeof thisArg !== 'undefined') {
                this.thisArg = thisArg;
            }
            if (captureRejections) {
                this.captureRejections = true;
            }
        }
    }
}

let commandRegistry = {};

/**
 * @param {string} command 
 * @param {(em: EventEmitter)=>void} handler 
 * @param {any} [opt]
 */
function register(command, handler, opt={}) {
    let em = new EventEmitter({captureRejections: true});
    commandRegistry[command] = [em, opt];
    handler(em);
}

function unregister(command) {
    commandRegistry[command][0].emit('unregister');
    delete commandRegistry[command];
}

function exec(commandStr, onerror=()=>null) {
    return new Promise(resolve => {
        let [commandResolver, ...args] = splitRegular(commandStr);
        const [em, opt] = commandRegistry[commandResolver];
        let shouldStopFlowing = false;
    
        em.on('error', onerror);
        em.once('error', () => {
            shouldStopFlowing = true;
            resolve(false);
        });
    
        em.emit('exec', ...args);
        if(shouldStopFlowing) return;
    
        let argCur;
        let unspecializedArgs = [];
    
        for (let i = 0; i < args.length;) {
            argCur = args[i];
            if (argCur.startsWith('-')) {
                let resCount = opt[argCur];
                if (resCount) {
                    let _args = args.slice(i + 1, i += resCount + 1);
                    em.emit(argCur, ..._args);
                } else {
                    em.emit(argCur);
                    i++;
                }
                if(shouldStopFlowing) return;
                continue;
            }
    
            i++;
            unspecializedArgs.push(argCur);
        }
        em.emit('default', ...unspecializedArgs);
        if(shouldStopFlowing) return;

        resolve(true);
        em.off('error', onerror);
    })
}

const states = {
    blank: 0,
    string: 1
};

/**
 * @param {string} str 
 */
function splitRegular(str) {
    str = str.trim();
    const len = str.length;
    let data = '';
    let res = [];
    let state = states.blank;

    for (let i = 0; i < len; i++) {
        const char = str[i];

        if (state === states.string && char === '"') {
            data += char;
            res.push(data);
            data = '';
            state = states.blank;
            continue;
        }

        if (state !== states.string && char === '"') {
            if (data) {
                res.push(data);
                data = '';
            }
            state = states.string;
            data += char;
            continue;
        }

        if (state === states.blank && char === ' ') {
            if (data) {
                res.push(data);
                data = '';
            }
        } else {
            if (char !== '"') {
                data += char;
            }
        }

        if (i === len-1) {
            res.push(data);
            data = '';
        }
    }

    return res;
}

class TConsole {
    static tConsole = null;
    static __emitter__ = new EventEmitter();
    static console = null;

    static showDetail = true;
    static tabSize = 2;
    static defaultSelector = '@a[tag=debugger]';
    static selector = TConsole.defaultSelector;

    getInstance(opt) {
        return TConsole.tConsole? TConsole.tConsole: new TConsole(opt);
    }

    constructor(opt, selector) {
        this.console = opt.console;
        this.update = opt.update;
        this.unregister = unregister;
        this.register = register;
        this.exec = exec;
        TConsole.tConsole = this;
        this.selector(selector);
    }

    getConsole() {
        return this.console;
    }

    injectConsole() {
        let Global = typeof window !== 'undefined'? window:
            typeof global !== 'undefined'? global:
                typeof globalThis !== 'undefined'? globalThis:
                    typeof self !== 'undefined'? self: {};
    
        Global.console = this.console;
    }

    showDetail(bool=true) {
        TConsole.showDetail = bool;
    }

    tabSize(count=2) {
        TConsole.tabSize = count;
    }

    update() {}

    selector(selector) {
        if(!selector) return TConsole.selector;
        TConsole.selector = selector;
    }

    on(type, handler) {
        TConsole.__emitter__.on(type, handler);
        return this;
    }

    off(type, handler) {
        TConsole.__emitter__.on(type, handler);
    }


}

const tab = () => new Array(TConsole.tabSize).fill(' ').join('');
const getTab = (count=1) => new Array(count).fill(tab()).join('');

class MsgBlock extends Array {
    static defaultColor = Formatting.white;
    static defaultStyle = Formatting.normal;

    toTellrawString(tabCount=0) {
        let [style, color, ...msgs] = this;

        style = style || MsgBlock.defaultStyle;
        color = color || MsgBlock.defaultColor;

        let msg = msgs.reduce((pre, cur) => {
            if (typeof cur === 'string') {
                return pre + cur;
            }

            if (typeof cur === 'object' && cur instanceof MsgBlock) {
                return pre + cur.toTellrawString();
            }
        }, '');

        let returnVal = getTab(tabCount) + (color + style + msg + Formatting.reset).trim();

        return returnVal.replace(/(§r)+/g, ($, $1) => $1);
    }

    toString(tabCount=0) {
        return this.toTellrawString(tabCount);
    }

}

function mbf(...iterable) {
    return MsgBlock.from(iterable);
}

/**
 * @param {keyof Formatting} key 
 * @returns 
 */
function style(key) {
    return Formatting[key];
}

const basic = {
    undefined: style('dark_blue'),
    boolean: style('dark_blue'),
    function: style('yellow'),
    number: style('aqua'),
    string: style('light_purple'),
    symbol: style('minecoin_gold')
};

const objectProp = {
    setterGetter: style('dark_green'),
    innenumerable: style('green'),
    preview: style('gray'),
    normal: style('blue'),
    prototype: style('dark_gray'),
    symbol: style('minecoin_gold')
};

function safeString(string) {
    return string.replace(/"/g,'\\"');
}

function basicTypeMsg(data) {
    const basicType = typeof data;
    if(basicType in basic) return basicTypeParser(data, basicType);
}

function functionMsg(data, color) {
    let str = safeString(data.toString());
    let firstBlank = str.indexOf(' ');
    if (str === '(') return str;
    return mbf(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank)));
}

function getFunctionSignature(func, color) {
    let str = safeString(func.toString());
    let signEnd = /\)[\s]*\{/.exec(func).index + 1;
    let firstBlank = str.indexOf(' ');

    if (str[0] === '(') return `<Anonymous>${str.slice(0, signEnd)}`;
    return mbf(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank, signEnd)));
}

function basicTypeParser(data, type) {
    let color = basic[type];
    if (type === 'function') {
        return functionMsg(data, color);
    }

    if (type === 'undefined') {
        return mbf('', color, 'undefined');
    }

    if (type === 'string') {
        return mbf('', color, safeString(`'${data.toString()}'`));
    }

    return mbf('', color, data.toString());
}

function fakeNativeToString(name, ...args) {
    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }`}
    return toString;
}

class RawTeller {
    static sender = null;
    /**
     * @type {[string, string][]}
     */
    msgQueue = [];
    pending = false;

    static header = '';
    /**
     * @type {RawTeller}
     */
    static rawTeller;
    
    constructor(header) {
        this.header = header || RawTeller.header;
        RawTeller.rawTeller = this;
    }

    send(msg, selector=TConsole.selector) {
        this.msgQueue.push([selector, msg]);
    }

    pend() {
        this.pending = true;
    }

    active() {
        if (this.pending) return;

        this.msgQueue.forEach(msg => {
            const [selector, message] = msg;
            RawTeller.sender(`tellraw ${selector} {"rawtext": [{"text": "${this.header}${message}"}]}`);
        });

        this.msgQueue = [];
    }

    setSender(func) {
        RawTeller.sender = func;
    }

}

/**
 * @param {any} commander 
 * @returns {Function}
 */
function getRawTeller(commander) {

    let sender = new RawTeller();
    sender.setSender(commander);

    function send(msg, selector) {
        sender.send(msg, selector);
    }

    send.toString = fakeNativeToString('send', 'msg', 'selector');

    send.update = () => {
        sender.active();
    };

    let senderProxy = new Proxy(send, {
        get(t, p) {
            return t[p];
        },

        set() { return false }
    });

    return senderProxy;
}

const UNTRUSTED_HEADER = 'Untrusted >';
const UNTRUSTED_HEADER_PREFIX = mbf(style('italic'), style('red'), UNTRUSTED_HEADER);

function sendUntrusted(msg, selector) {
    RawTeller.rawTeller.send(UNTRUSTED_HEADER_PREFIX + getTab() + msg, selector);
}

function send(msg, selector) {
    RawTeller.rawTeller.send(msg, selector);
}

const ConsoleSpecified = {
    '-o': 1,
    '-b': 0,
    '--open': 1,
    '--back': 0,
    '-p': 1
};

async function _openLogic(terminal, index, msgBuilder) {
    let data = terminal.get(index);
    let msg = await msgBuilder('normal', data);
    terminal.pushContext();

    send(msg);
}

async function _backLogic(terminal, msgBuilder) {
    if(!terminal.index) return;

    let data = terminal.clearContext();
    let msg = await msgBuilder('normal', data);

    send(msg);
}

class Context {
    data = null;
    previews = [];
    constructor(data, previews) {
        this.data = data;
        this.previews = previews;
    }
 }

class ConsoleTerminal {
    static contexts = [];
    static counter = -1;
    context  = null;
    index = 0;

    constructor(msgBuilder) {

        const openLogic = index => {
            _openLogic(this, index, msgBuilder);
        };

        const backLogic = () => {
            _backLogic(this, msgBuilder);
        };

        register('con', em => {
            em.on('-o', openLogic);
            em.on('--open', openLogic);
            em.on('-b', backLogic);
            em.on('--back', backLogic);
            em.on('-p', async data => sendUntrusted(await msgBuilder('normal', data)));

            em.on('unregister', () => {
                em.removeAllListeners('-o');
                em.removeAllListeners('--open');
                em.removeAllListeners('-b');
                em.removeAllListeners('--back');
                em.removeAllListeners('-p');
            });
        }, ConsoleSpecified);

        let arr = [];
        TConsole.__emitter__.on('--object', data => {
            ConsoleTerminal.counter = -1;
            this.context = new Context(data, [...arr]);
            if(!ConsoleTerminal.contexts.length) this.pushContext();
        });

        TConsole.__emitter__.on('--preview', data => {
            ConsoleTerminal.counter++;
            arr.push(data);
        });

    }

    clearContext() {
        ConsoleTerminal.contexts.length = this.index;
        this.index--;
        this.updateContext();
        return this.context.data;
    }

    pushContext() {
        this.index = ConsoleTerminal.contexts.length;
        ConsoleTerminal.contexts.push(this.context);
        this.updateContext();
    }

    updateContext() {
        this.context = ConsoleTerminal.contexts[this.index];
    }

    get(index=0) {
        return this.context.previews[index];
    }

}

async function toString(obj, showDetails=false) {
    let returnVal;
    if (!showDetails) {
        returnVal = await getPreviewMsg(obj);
    }
    returnVal = await getDetailsMsg(obj);

    TConsole.__emitter__.emit('--object', obj);

    return returnVal;
}

function getProto(obj) {
    return Object.getPrototypeOf(obj);
}

function getClassPrefix(obj) {
    let __proto__ = getProto(obj);
    let constructor;

    if(!__proto__) return '';

    constructor = __proto__.constructor;
    return constructor.name;
}

function getObjPropNames(obj) {
    let arr = [];
    for (const k in obj) {
        arr.push(k);
    }
    return arr;
}

function getObjSymbols(obj) {
    return Object.getOwnPropertySymbols(obj);
}

function getObjDescriptors(obj) {
    return Object.getOwnPropertyDescriptors(obj);
}

async function keyValTile(obj, k, propColor) {
    let ks;
    let vs;

    if (k === '[[Prototype]]') {
        let prefix = getClassPrefix(obj);
        if (!prefix) return '';
        return mbf('', objectProp.prototype, k, ':  ',  prefix);
    }

    ks = typeof k === 'symbol'?
            mbf(style('italic'), objectProp.symbol, safeString(k.toString())):
            mbf(style('italic'), propColor, safeString(k));

    vs = typeof obj[k] === 'object'?
        (await parseObjValue(obj[k])): basicTypeMsg(obj[k]);

    if (typeof obj[k] === 'object' && obj[k]) {
        TConsole.__emitter__.emit('--preview', obj[k]);
        vs.push(getTab() + `$${ConsoleTerminal.counter}`);
    }

    return mbf('', style('normal'), ks, ':  ', vs);

}

async function parseExtend(obj, showInnenumerable=true) {
    const objDesc = getObjDescriptors(obj);
    let res = mbf();

    for (const k in objDesc) {
        const desc = objDesc[k];
        const {set, get, enumerable} = desc;
        const propName = safeString(typeof k === 'symbol'? k.toString(): k);
        let msg = mbf();

        if (typeof get === 'function') {
            msg.push('\n');
            msg.push('', objectProp.setterGetter, `get ${propName}: `, await parseValPreview(get));
        }

        if (typeof set === 'function') {
            msg.push('\n');
            msg.push('', objectProp.setterGetter, `set ${propName}: `, await parseValPreview(set));
        }

        if (!enumerable && showInnenumerable) {
            msg.push('\n');
            msg.push('', objectProp.innenumerable, k, ': ', await parseValPreview(obj[k]));
        }

        if(msg.length) res.push(...msg);
    }

    if(res.length) return res;
    return '';
}

async function paresePrototype(obj) {

    let res = mbf();
    let __proto__ = obj;

    while ((__proto__ = getProto(__proto__)) !== Object.prototype && __proto__) {
        res.push(await parseExtend(__proto__, false));
    }

    return res;
}

async function getDetailsMsg(obj) {
    let propColor = objectProp.normal;
    let classPrefix = getClassPrefix(obj);
    let props = [];

    let msg = mbf('\n', style('normal'), `${await parseValPreview(obj, classPrefix)}:`);
    props = props.concat(getObjPropNames(obj)).concat(getObjSymbols(obj));

    for (const cur of props) {
        msg.push('\n', await keyValTile(obj, cur, propColor));
    }

    let extend = await parseExtend(obj);
    if (extend.length > 2) {
        msg.push(extend);
    }

    msg.push(await paresePrototype(obj));

    const prototypeClassPrefix = await keyValTile(obj, '[[Prototype]]', propColor);
    if(prototypeClassPrefix) msg.push('\n', prototypeClassPrefix);
    
    return msg;
}

async function getPreviewMsg(obj) {
    let propColor = objectProp.preview;
    let classPrefix = getClassPrefix(obj);

    let msg = mbf(style('italic'), style('normal'), `${classPrefix} {`);
    let props = getObjPropNames(obj);
    for (const cur of props) {
        msg.push('\n', await keyValTile(obj, cur, propColor));
    }
    msg.push('}');

    return msg;
}

async function parseObjValue(obj) {
    let classPrefix = getClassPrefix(obj);
    if (obj === null) {
        return mbf('', basic.undefined, 'null');
    }
    
    if(obj instanceof Array) {
        return await parseArray(obj, classPrefix);
    }

    return await parseValPreview(obj, classPrefix);
}

async function parseArray(obj, classPrefix) {
    if (classPrefix === 'Array') classPrefix = '';
    let res = mbf(style('italic'), '', `${classPrefix}(${obj.length}) [`);
    let i = 0;
    for (const cur of obj) {
        if (typeof cur === 'object') {
            if (cur === null) res.push(mbf('', basic.undefined, 'null'));
            else res.push(await parseValPreview(cur, classPrefix));
        } else {
            res.push(basicTypeMsg(cur));
        }
        if (i < obj.length - 1) {
            res.push(', ');
        }
        i++;
    }
    res.push(']');
    return res;
}

async function parseValPreview(obj, classPrefix) {

    const keys = specClassParsers.keys();
    for (const k of keys) {
        if (obj instanceof k) {
            return await getSpecParser(k).call(undefined, obj, classPrefix);
        }
    }

    if (typeof obj !== 'object') {
        return basicTypeMsg(obj);
    }

    classPrefix = classPrefix? classPrefix + ' ': '';
    return mbf('', objectProp.preview, `${classPrefix}{ ... }`,);
}

/**
 * @type {Map<Function, Function>}
 */
let specClassParsers = new Map();

function getSpecParser(instanceClass) {
    if (specClassParsers.has(instanceClass)) {
        return specClassParsers.get(instanceClass);
    }

    return null;
}

function registerSpecParser(instanceClass, handler) {
    specClassParsers.set(instanceClass, handler);
}

const getPromiseState = (() => {
    let obj = {};
    let promiseState = Symbol('promiseState');
    let promiseValue = Symbol('promiseValue');

    return p => {
        let _p = Promise.race([p, obj]);
        _p[promiseState] = 'pending';

        _p.then(v => {
            if (v === obj) _p[promiseState] = 'pending';
            else _p[promiseState] = 'fulfilled', _p[promiseValue] = v;
        }, reason => (_p[promiseState] = 'rejected', _p[promiseValue] = reason));

        return {promiseState, promiseValue, p: _p};
    };

})();

function doRegisterSpecParsers() {
    registerSpecParser(Array, (obj, classPrefix) => {
        return mbf(style('italic'), objectProp.preview, `${classPrefix}`, '(', basicTypeMsg(obj.length), style('italic'), objectProp.preview, ')');
    });

    registerSpecParser(Promise, async (obj, classPrefix) => {
        let {promiseState, promiseValue, p} = getPromiseState(obj);
        let state = p[promiseState];
        let value = p[promiseValue];
        let message;
        
        let msg = async () => {
            state = p[promiseState];
            value = p[promiseValue];
            return mbf(style('italic'), objectProp.preview, `${classPrefix}`, ` { <${state}>${state === 'pending'? '': ': ' + (typeof value === 'object'? await parseValPreview(value, classPrefix): basicTypeMsg(value))} }`);
        };

        try {
            await p;
        } catch (error) {}

        message = await msg();

        return message;
    });


    registerSpecParser(Error, obj => {
        return mbf('', style('normal'), obj.stack);
    });

    registerSpecParser(Function, obj => {
        const msg = getFunctionSignature(obj, basic.function);
        return mbf('', basic.function, msg);
    });


}

class Format {
    /**
     * @type {Format[]}
     */
    static formats = [];

    constructor(opt) {
        this.checker = opt.checker;
        this.parse = opt.parse;

        Format.formats.push(this);
    }

}

function check(str) {
    let i = 0;
    for (const format of Format.formats) {
        if (format.checker.test(str)) {
            return i;
        }
        i++;
    }
    return false;
}

/**
 * @param {{checker: RegExp, parse: (value: any) => any}} opt 
 */
function addFormat(opt) {
    return new Format(opt);
}

async function parseFormat(str, value, format) {
    const res = format.checker.exec(str);
    const args = [...res];
    const returnVal = await format.parse(value, ...args);

    return str.replace(format.checker, returnVal);
}

async function getfstr(formatStr, ...args) {
    let _args = [...args];
    let index;
    let returnVal;

    while (typeof (index = check(await returnVal || formatStr)) === 'number') {
        let value = _args.shift();
        let format = Format.formats[index];

        returnVal = await parseFormat(returnVal || formatStr, value, format);
    }

    return returnVal;
}

function initfstring() {

    addFormat({
        checker: /%d/,
        parse(value) {
            return mbf('', basic.number, new Number(value).toFixed(0));
        }
    });
    
    addFormat({
        checker: /%[o|O]/,
        async parse(v) {
            return mbf(style('italic'), style('normal'), await toString(v, TConsole.showDetail));
        }
    });
    
    addFormat({
        checker: /%(.*?)f/,
        parse(v, $, $1) {
            if ($1.startsWith('.')) {
                $1 = $1.slice(1);
                return mbf('', basic.number, new Number(v).toFixed(+$1));
            }
            return mbf('', basic.number, new Number(v));
        }
    });

}

function initConsole(commander, selector) {

    doRegisterSpecParsers();
    initfstring();


    const rawSend = getRawTeller(commander);
    const send = async msg => rawSend(await msg, selector);

    async function buildMsg(s='white', ...args) {
        let res = mbf('', style(s));
        let i = -1;

        if (typeof args[0] === 'string') {
            let fstr = await getfstr(...args);
            if (fstr) return fstr;
        }

        for (const cur of args) {
            i++;
            let msg = typeof cur === 'object'? await toString(cur, TConsole.showDetail): 
                typeof cur === 'string'? mbf('', style(s), safeString(cur)): basicTypeMsg(cur);

            if (i) res.push(getTab());
            res.push(msg);
        }

        return res;
    }

    new ConsoleTerminal(buildMsg, selector);

    function log(...args) {
        let res;
        try {
            res = buildMsg('white', ...args);
        } catch (e) {
            error(e);
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg('red', ...args);
        } catch (e) {
            send(mbf('', style('red'), 'Fatal Error: You should have crashed your game!'));
        }

        send(err);
    }

    function warn(...args) {
        let res;
        try {
            res = buildMsg('yellow', ...args);
        } catch (e) {
            error(e);
        }

        send(res);
    }

    function getTraceStack(sliceStart=0) {
        return Error('').stack.split('\n').slice(sliceStart+2).join('\n');
    }

    function trace() {
        let stack = getTraceStack(1);
        stack = 'trace():\n' + stack;
        
        send(buildMsg('white', stack));
    }

    function assert(condition, ...data) {
        if (!condition) {
            error('Assertion failed: ', ...data, getTraceStack(1));
        }
    }

    let _counts = {};
    function count(label='default') {
        _counts[label]? _counts[label]++: _counts[label] = 1;
        log(`${label}: ${_counts[label]}`);
    }

    function countReset(label='default') {
        if (_counts[label]) {
            delete _counts[label];
        }
    }


    let _tickNow = 1;
    let _timers = {};
    function updateTimer() {
        _tickNow++;
    }

    function time(label='default') {
        _timers[label] = _tickNow;
    }

    function timeLog(label='default') {
        let tkNow = _tickNow;
        let tkBefore = _timers[label];

        if (!tkBefore) {
            warn(`Timer '${label}' does not exist`, getTraceStack(1));
            return;
        }

        let res = tkNow - tkBefore;
        log(`${label}: ${res} ticks (${res * 50} ms)`);
    }

    function timeEnd(label='default') {
        timeLog(label);
        if (_timers[label]) {
            delete _timers[label];
        }
    }


    function updateRawTeller() {
        rawSend.update();
    }

    function update() {
        updateTimer();
        updateRawTeller();
    }

    const _console = {
        log, error, warn, trace, assert, count, countReset, 
        time, timeLog, timeEnd
    };

    return new TConsole({update, console: _console});

}

export { initConsole };
