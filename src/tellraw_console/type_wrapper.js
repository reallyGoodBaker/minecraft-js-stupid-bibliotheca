import { basic } from './style.js'
import { mbf, style } from './msgblock.js'

export function safeString(string) {
    return string.replace(/"/g, '\\"');
}

export function basicTypeMsg(data) {
    const basicType = typeof data;
    if (basicType in basic) return basicTypeParser(data, basicType);
}

export function functionMsg(data, color) {
    let str = safeString(data.toString());
    let firstBlank = str.indexOf(' ');
    if (str === '(') return str;
    return mbf(style('italic'), color, str.slice(0, firstBlank), mbf('', style('normal'), str.slice(firstBlank)));
}

export function getFunctionSignature(func, color) {
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