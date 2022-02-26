import {basicTypeMsg} from './type_wrapper.js'
import {toString} from './obj2str.js';
import {getRawTeller} from './sender.js'
import {Formatting} from './text_formattings.js'

export function initConsole(commander) {
    const send = getRawTeller(commander);

    function log(...args) {
        let res;
        try {
            Formatting.normal = Formatting.white;
            res = args.reduce((pre, cur) => {
                return [
                    ...pre,
                    typeof cur === 'object'? toString(cur, false): basicTypeMsg(cur)
                ]
            }, []).join('    ');
        } catch (e) {
            error(e)
        }

        send(res);
    }

    function error(...args) {
        try {
            Formatting.normal = Formatting.red;
            log(...args);
        } catch (e) {
            error(e);
        }
    }

    function warn(...args) {
        Formatting.normal = Formatting.yellow;
        log(...args)
    }

    return {
        log, error, warn
    }

}