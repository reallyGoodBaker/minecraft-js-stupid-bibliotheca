import {objectProp, basic} from './style.js'
import {mbfs, style} from './msgblock.js'
import {safeString, basicTypeMsg} from './type_wrapper.js'

export function toString(obj, showDetails=false, showSetterGetter=false) {
    if (!showDetails) {
        return getPreviewMsg(obj);
    }
    return getDetailsMsg(obj, showSetterGetter);
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

function keyValTile(obj, k, propColor) {
    let ks;
    let vs;

    ks = typeof k === 'symbol'?
        mbfs(style('italic'), objectProp.symbol, safeString(k.toString())):
        mbfs(style('italic'), propColor, safeString(k));

    vs = typeof obj[k] === 'object'?
        parseObjValue(obj[k]): basicTypeMsg(obj[k]);

    return mbfs('', style('normal'), ks, ':  ', vs);

}

function getDetailsMsg(obj, showSG) {
    let propColor = objectProp.normal;
    let classPrefix = getClassPrefix(obj);
    let props;

    let msg = mbfs('', style('normal'), `${classPrefix} {\n`);
    props = props.concat(getObjPropNames()).concat(getObjSymbols());

    msg += getObjPropNames(obj).reduce((pre, cur) => {
        return [...pre, keyValTile(obj, cur, propColor)];
    }, []).join(', ') + '\n';

    msg += '}';
    console.log(msg);
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