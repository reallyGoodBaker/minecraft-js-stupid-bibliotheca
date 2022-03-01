import {basicTypeMsg, safeString} from './type_wrapper.js'
import {toString, doRegisterSpecParsers} from './obj2str.js';
import {getRawTeller} from './sender.js'
import { style, mbf, getTab } from './msgblock.js';
import {getfstr, initfstring} from './fstring.js';

export function initConsole(commander, selector) {

    doRegisterSpecParsers();
    initfstring();


    const rawSend = getRawTeller(commander);
    const send = async msg => rawSend(await msg, selector);

    async function buildMsg(s='white', ...args) {
        let res = mbf('', style(s));
        let i = -1;

        if (typeof args[0] === 'string') {
            let fstr = await getfstr(...args);
            if (fstr) return fstr;
        }

        for (const cur of args) {
            i++;
            let msg = typeof cur === 'object'? await toString(cur, true): 
                typeof cur === 'string'? mbf('', style(s), safeString(cur)): basicTypeMsg(cur);

            if (i) res.push(getTab());
            res.push(msg);
        }

        return res;
    }

    function log(...args) {
        let res;
        try {
            res = buildMsg('white', ...args);
        } catch (e) {
            error(e)
            // console.warn(e);
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg('red', ...args)
        } catch (e) {
            send(mbf('', style('red'), 'Fatal Error: You should have crashed your game!'));
        }

        send(err);
    }

    function warn(...args) {
        let res;
        try {
            res = buildMsg('yellow', ...args);
        } catch (e) {
            error(e)
        }

        send(res);
    }

    function getTraceStack(sliceStart=0) {
        return Error('').stack.split('\n').slice(sliceStart+2).join('\n');
    }

    function trace() {
        let stack = getTraceStack(1);
        stack = 'trace():\n' + stack;
        
        send(buildMsg('white', stack));
    }

    function assert(condition, ...data) {
        if (!condition) {
            error('Assertion failed: ', ...data, getTraceStack(1));
        }
    }

    let _counts = {};
    function count(label='default') {
        _counts[label]? _counts[label]++: _counts[label] = 1;
        log(`${label}: ${_counts[label]}`);
    }

    function countReset(label='default') {
        if (_counts[label]) {
            delete _counts[label];
        }
    }


    let _tickNow = 1;
    let _timers = {};
    function updateTimer() {
        _tickNow++;
    }

    function time(label='default') {
        _timers[label] = _tickNow;
    }

    function timeLog(label='default') {
        let tkNow = _tickNow;
        let tkBefore = _timers[label];

        if (!tkBefore) {
            warn(`Timer '${label}' does not exist`, getTraceStack(1));
            return;
        }

        let res = tkNow - tkBefore;
        log(`${label}: ${res} ticks (${res * 50} ms)`);
    }

    function timeEnd(label='default') {
        timeLog(label);
        if (_timers[label]) {
            delete _timers[label];
        }
    }


    function updateRawTeller() {
        rawSend.update();
    }

    function update() {
        updateTimer();
        updateRawTeller();
    }

    const _console = {
        log, error, warn, trace, assert, count, countReset, 
        time, timeLog, timeEnd, 
    }

    return {update, console: _console}

}

export function injectConsole(commander, selector) {
    let Module = initConsole(commander, selector);

    let Global = typeof window !== 'undefined'? window:
        typeof global !== 'undefined'? global:
            typeof globalThis !== 'undefined'? globalThis:
                typeof self !== 'undefined'? self: {};

    Global.console = Module.console;

    return Module.update;
}