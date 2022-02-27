import {basicTypeMsg, safeString} from './type_wrapper.js'
import {toString} from './obj2str.js';
import {getRawTeller} from './sender.js'
import {Formatting} from '../format.js'
import { style, mbf } from './msgblock.js';

export function initConsole(commander, selector) {
    const rawSend = getRawTeller(commander);
    const send = async msg => rawSend(await msg, selector);

    async function buildMsg(s='white', ...args) {
        let res = mbf('', style(s));

        for (const cur of args) {
            let msg = typeof cur === 'object'? await toString(cur, true): 
                typeof cur === 'string'? mbf('', style(s), safeString(cur)): basicTypeMsg(cur);

            res.push(msg);
        }

        return res;
    }

    function log(...args) {
        let res;
        try {
            res = buildMsg(style('white'), ...args);
        } catch (e) {
            error(e)
            // console.warn(e);
        }

        send(res);
    }

    function error(...args) {
        let err;
        try {
            err = buildMsg(style('red'), ...args)
        } catch (e) {
            send(mbf('', style('red'), 'Fatal Error: You should have crashed your game!'));
        }

        send(err);
    }

    function warn(...args) {
        let res;
        try {
            res = buildMsg(style('yellow'), ...args);
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
        
        send(buildMsg(style('white'), stack));
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

    return {
        log, error, warn, trace, assert, count, countReset, 
        time, timeLog, timeEnd, update, 
    }

}

export function injectConsole(commander, selector) {
    let console = initConsole(commander, selector);
    const update = () => console.update();
    delete console.update;

    (window || global || globalThis).console = console;

    return update;
}