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

}

function mb(iterable) {
    return MsgBlock.from(iterable);
}

function mbf(...iterable) {
    return MsgBlock.from(iterable);
}

function mbfs(...iterable) {
    return mb(iterable).toTellrawString();
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
    return mbfs(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank)));
}

function basicTypeParser(data, type) {
    let color = basic[type];
    if (type === 'function') {
        return functionMsg(data, color);
    }

    if (type === 'undefined') {
        return mbfs('', color, 'undefined');
    }

    if (type === 'string') {
        return mbfs('', color, safeString(`'${data.toString()}'`));
    }

    return mbfs('', color, data.toString());
}

function toString(obj, showDetails=false, showSetterGetter=false) {
    if (!showDetails) {
        return getPreviewMsg(obj);
    }
    return getDetailsMsg(obj);
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

function keyValTile(obj, k, propColor) {
    let ks;
    let vs;

    ks = typeof k === 'symbol'?
        mbfs(style('italic'), objectProp.symbol, safeString(k.toString())):
        mbfs(style('italic'), propColor, safeString(k));

    vs = typeof obj[k] === 'object'?
        parseObjValue(obj[k]): basicTypeMsg(obj[k]);

    return mbfs('', style('normal'), ks, ':  ', vs.replace(/\n/g, '\n  '));

}

function getDetailsMsg(obj, showSG) {
    let propColor = objectProp.normal;
    let classPrefix = getClassPrefix(obj);
    let props = [];

    let msg = mbfs('', style('normal'), `${classPrefix? classPrefix + ' ': ''}{\n`);
    props = props.concat(getObjPropNames(obj)).concat(getObjSymbols(obj));

    msg += props.reduce((pre, cur) => {
        return [...pre, keyValTile(obj, cur, propColor)];
    }, []).join(', \n') + '\n';

    msg += '}';
    
    return msg;
}

function getPreviewMsg(obj) {
    let propColor = objectProp.preview;
    let classPrefix = getClassPrefix(obj);

    let msg = mbfs(style('italic'), style('normal'), `${classPrefix} {`);
    msg += getObjPropNames(obj).reduce((pre, cur) => {
        return [...pre, keyValTile(obj, cur, propColor)];
    }, []).join(', ');
    msg += '}';

    return msg;
}

function parseObjValue(obj) {
    let classPrefix = getClassPrefix(obj);

    if (obj === null) {
        return mbfs('', basic.undefined, 'null');
    }

    if(obj instanceof Array) {
        return parseArray(obj, classPrefix);
    }

    return parseValPreview(obj, classPrefix);
}

function parseArray(obj, classPrefix) {
    if (classPrefix === 'Array') classPrefix = '';
    return mbfs(style('italic'), '', `${classPrefix} (${obj.length}) [${obj.reduce((pre, cur) => {
        if (typeof cur === 'object') {
            if (cur === null) return [...pre, mbfs('', basic.undefined, 'null')];
            return [...pre, parseValPreview(cur, classPrefix)];
        }

        return [...pre, basicTypeMsg(cur)];
    }, []).join(', ')}]`);
}

function parseValPreview(obj, classPrefix) {
    if (obj instanceof Array) {
        return mbfs(style('italic'), objectProp.preview, `${classPrefix}`) + '(' + basicTypeMsg(obj.length) + ')';
    }

    return mbfs('', objectProp.preview, `${classPrefix} { ... }`);
}

function fakeNativeToString(name, ...args) {
    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }`}
    return toString;
}

class RawTeller {
    sender = null;

    static header = '';
    
    constructor(header) {
        this.header = header || RawTeller.header;
    }

    send(msg, selector='@a[tag=debugger]') {
        this.sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${this.header} ${msg}"}]}`);
        //this.sender.runCommand(msg, selector);
    }

    setSender(s) {
        this.sender = s;
    }

}

mbf('', style('red'), '[Untrusted] ');

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

    let senderProxy = new Proxy(send, {
        get(t, p) {
            return t[p];
        },

        set() { return false }
    });

    return senderProxy;
}

function initConsole(commander, selector) {
    const rawSend = getRawTeller(commander);
    const send = msg => rawSend(msg, selector);

    function buildMsg(normalStyle = '', ...args) {
        let res;
        Formatting.normal = normalStyle;
        res = args.reduce((pre, cur) => {
            return [
                ...pre,
                typeof cur === 'object'? toString(cur, true): 
                    typeof cur === 'string'? mbfs('', style('normal'), safeString(cur)): basicTypeMsg(cur)
            ]
        }, []).join('  ');
        Formatting.normal = '';
        return res;
    }

    function log(...args) {
        let res;
        try {
            res = buildMsg(style('white'), ...args);
        } catch (e) {
            error(e);
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg(style('red'), ...args);
        } catch (e) {
            send(mbfs('', style('red'), 'Fatal Error: You should have crashed your game!'));
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


    return {
        log, error, warn, trace, assert, count, countReset, 
        updateTimer, time, timeLog, timeEnd, 
    }

}

export { initConsole };
