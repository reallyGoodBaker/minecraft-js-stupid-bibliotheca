import { mbf, style } from "./msgblock.js";
import { toString } from "./obj2str.js";
import { basic } from './style.js';

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
export function addFormat(opt) {
    return new Format(opt);
}

async function parseFormat(str, value, format) {
    const res = format.checker.exec(str);
    const args = [...res];
    const returnVal = await format.parse(value, ...args);

    return str.replace(format.checker, returnVal);
}

export async function getfstr(formatStr, ...args) {
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

export function initfstring() {

    addFormat({
        checker: /%d/,
        parse(value) {
            return mbf('', basic.number, new Number(value).toFixed(0));
        }
    });
    
    addFormat({
        checker: /%[o|O]/,
        async parse(v) {
            return mbf(style('italic'), style('normal'), await toString(v, true));
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
