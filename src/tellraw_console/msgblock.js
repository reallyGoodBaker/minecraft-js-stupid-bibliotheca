import {Formatting} from '../format.js'
import {TConsole} from './tconsole.js'

const tab = () => new Array(TConsole.tabSize).fill(' ').join('');
export const getTab = (count=1) => new Array(count).fill(tab()).join('');

export class MsgBlock extends Array {
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

export function mb(iterable) {
    return MsgBlock.from(iterable);
}

export function mbf(...iterable) {
    return MsgBlock.from(iterable);
}

export function mbs(iterable) {;
    return mb(iterable).toTellrawString();
}

export function mbfs(...iterable) {
    return mb(iterable).toTellrawString();
}

/**
 * @param {keyof Formatting} key 
 * @returns 
 */
export function style(key) {
    return Formatting[key];
}

