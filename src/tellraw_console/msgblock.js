import { style } from '../format.js'
export { style } from '../format.js'
import { TConsole } from './tconsole.js'

const tab = () => new Array(TConsole.tabSize).fill(' ').join('');
export const getTab = (count = 1) => new Array(count).fill(tab()).join('');

export class MsgBlock extends Array {
    static get defaultColor() {
        return style('white')
    }
    static get defaultStyle() {
        return style('normal')
    }

    toTellrawString(tabCount = 0) {
        let [_style, color, ...msgs] = this;

        _style = _style || MsgBlock.defaultStyle;
        color = color || MsgBlock.defaultColor;

        let msg = msgs.reduce((pre, cur) => {
            if (typeof cur === 'string') {
                return pre + cur;
            }

            if (typeof cur === 'object' && cur instanceof MsgBlock) {
                return pre + cur.toTellrawString();
            }
        }, '');

        let returnVal = getTab(tabCount) + (color + _style + msg + style('reset')).trim();

        return returnVal
    }

    toString(tabCount = 0) {
        return this.toTellrawString(tabCount);
    }

}

export function mb(iterable) {
    return MsgBlock.from(iterable);
}

export function mbf(...iterable) {
    return MsgBlock.from(iterable);
}

export function mbs(iterable) {
    ;
    return mb(iterable).toTellrawString();
}

export function mbfs(...iterable) {
    return mb(iterable).toTellrawString();
}

