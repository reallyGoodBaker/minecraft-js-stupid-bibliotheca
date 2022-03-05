import {objectProp, basic} from './style.js'
import {style, mbf, getTab} from './msgblock.js'
import {safeString, basicTypeMsg, getFunctionSignature} from './type_wrapper.js'
import {TConsole} from './tconsole.js'
import {ConsoleTerminal} from './commands.js'

export async function toString(obj, showDetails=false) {
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

function getObjInnenumerablePropNames(obj) {
    const descs = getObjDescriptors(obj);
    let res = [];

    for (const key in descs) {
        if (Object.hasOwnProperty.call(descs, key)) {
            const desc = descs[key];
            if (!desc.enumerable) {
                res.push(key);
            }
        }
    }

    return res;
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
            res.push(', ')
        }
        i++;
    }
    res.push(']')
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

export function registerSpecParser(instanceClass, handler) {
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

})()

export function doRegisterSpecParsers() {
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
        }

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
    })


}
