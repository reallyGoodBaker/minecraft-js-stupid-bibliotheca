import {basic} from './style.js'
import {mbf, mbfs, style} from './msgblock.js'

export function safeString(string) {
    return string.replace(/"/g,'\\"');
}

export function basicTypeMsg(data) {
    const basicType = typeof data;
    if(basicType in basic) return basicTypeParser(data, basicType);
}

export function functionMsg(data, color) {
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