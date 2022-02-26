import {Formatting} from '../format.js'

export class MsgBlock extends Array {
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

