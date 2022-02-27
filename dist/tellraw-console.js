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

class MsgBlock extends Array {
    static defaultColor = Formatting.white;
    static defaultStyle = Formatting.normal;

    toTellrawString() {
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

        return color + style + msg + Formatting.reset;
    }

    toString() {
        return this.toTellrawString();
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
     * @type {[string, string, any][]}
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

    send(msg, selector='@a[tag=debugger]') {
        this.msgQueue.push([selector, msg, RawTeller.sender]);
    }

    pend() {
        this.pending = true;
    }

    active() {
        if (this.pending) return;

        this.msgQueue.forEach(msg => {
            const [selector, message, sender] = msg;
            sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${this.header} ${message}"}]}`);
        });

        this.msgQueue = [];
    }

    setSender(s) {
        RawTeller.sender = s;
    }

}

// const untrustedHeader = mbf('', style('red'), '[Untrusted] ');

// export class UntrustedRawTeller extends RawTeller {

//     constructor(header) {
//         super(header);

//         this.send = this.sendUntrusted;
//     }

//     sendUntrusted(msg, selector='@a[tag=debugger]') {
//         try {
//             this.sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${untrustedHeader + msg}"}]}`);
//         } catch (error) {
//             this.onError.call(undefined, e, msg, selector);
//         }
//     }

//     setSender(s) {
//         this.sender = s;
//     }

//     onError(e) {
//     }

// }

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

async function toString(obj, showDetails=false, showSetterGetter=false) {
    if (!showDetails) {
        return await getPreviewMsg(obj);
    }
    return await getDetailsMsg(obj);
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

async function keyValTile(obj, k, propColor) {
    let ks;
    let vs;

    ks = typeof k === 'symbol'?
        mbf(style('italic'), objectProp.symbol, safeString(k.toString())):
        mbf(style('italic'), propColor, safeString(k));

    vs = typeof obj[k] === 'object'?
        (await parseObjValue(obj[k])): basicTypeMsg(obj[k]);

    return mbf('', style('normal'), ks, ':  ', vs, '\n');

}

async function getDetailsMsg(obj, showSG) {
    let propColor = objectProp.normal;
    let classPrefix = getClassPrefix(obj);
    let props = [];

    let msg = mbf('', style('normal'), `${classPrefix? classPrefix + ' ': ''}{\n`);
    props = props.concat(getObjPropNames(obj)).concat(getObjSymbols(obj));

    for (const cur of props) {
        msg.push(await keyValTile(obj, cur, propColor));
    }

    msg.push('}');
    
    return msg;
}

async function getPreviewMsg(obj) {
    let propColor = objectProp.preview;
    let classPrefix = getClassPrefix(obj);

    let msg = mbf(style('italic'), style('normal'), `${classPrefix} {`);
    let props = getObjPropNames(obj);
    for (const cur of props) {
        msg.push(await keyValTile(obj, cur, propColor));
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
    let res = mbf(style('italic'), '', `${classPrefix? classPrefix+' ': ''}(${obj.length}) [`);
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

    return mbf('', objectProp.preview, `${classPrefix} { ... }`);
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

/**
 * @type {<T>(instanceClass: T extends instanceClass, handler: (obj: T, classPrefix: string) => string)}
 */
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
        return mbf(style('italic'), objectProp.preview, `${classPrefix}`, '(', basicTypeMsg(obj.length), ')');
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


}

doRegisterSpecParsers();

function initConsole(commander, selector) {
    const rawSend = getRawTeller(commander);
    const send = async msg => rawSend(await msg, selector);

    async function buildMsg(s='white', ...args) {
        let res = mbf('', style(s));

        for (const cur of args) {
            let msg = typeof cur === 'object'? await toString(cur, true): 
                typeof cur === 'string'? mbf('', style(s), safeString(cur)): basicTypeMsg(cur);

            res.push(msg);
        }

        return res;
    }

    function log(...args) {
        let res;
        try {
            res = buildMsg(style('white'), ...args);
        } catch (e) {
            error(e);
            // console.warn(e);
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg(style('red'), ...args);
        } catch (e) {
            send(mbf('', style('red'), 'Fatal Error: You should have crashed your game!'));
        }

        send(err);
    }

    function warn(...args) {
        let res;
        try {
            res = buildMsg(style('yellow'), ...args);
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
        
        send(buildMsg(style('white'), stack));
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

    return {
        log, error, warn, trace, assert, count, countReset, 
        time, timeLog, timeEnd, update, 
    }

}

function injectConsole(commander, selector) {
    let console = initConsole(commander, selector);
    const update = () => console.update();
    delete console.update;

    let Global = typeof window !== 'undefined'? window:
        typeof global !== 'undefined'? global:
            typeof globalThis !== 'undefined'? globalThis:
                typeof self !== 'undefined'? self: {};

    Global.console = console;

    return update;
}

export { initConsole, injectConsole };
