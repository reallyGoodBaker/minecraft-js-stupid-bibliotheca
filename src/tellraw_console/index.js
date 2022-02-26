import {basicTypeMsg, safeString} from './type_wrapper.js'
import {toString} from './obj2str.js';
import {getRawTeller} from './sender.js'
import {Formatting} from '../format.js'
import { mbfs, style } from './msgblock.js';

export function initConsole(commander, selector) {
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
            error(e)
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg(style('red'), ...args)
        } catch (e) {
            send(mbfs('', style('red'), 'Fatal Error: You should have crashed you game!'));
        }

        send(err);
    }

    function warn(...args) {
        Formatting.normal = Formatting.yellow;
        log(...args)
    }

    return {
        log, error, warn
    }

}