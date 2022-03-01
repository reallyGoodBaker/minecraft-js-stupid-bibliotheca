import { mbf, style, getTab } from "./msgblock.js";
import { RawTeller } from "./sender.js";
import {EventEmitter} from '../events.js'

const UNTRUSTED_HEADER = 'Untrusted >';
const UNTRUSTED_HEADER_PREFIX = mbf(style('italic'), style('red'), UNTRUSTED_HEADER);

function sendUntrusted(msg, selector) {
    RawTeller.rawTeller.send(UNTRUSTED_HEADER_PREFIX + getTab() + msg, selector);
}

function send(msg, selector) {
    RawTeller.rawTeller.send(msg, selector);
}

let commandRegistry = {};

/**
 * @param {string} command 
 * @param {(em: EventEmitter)=>void} handler 
 * @param {{thisArg?: any;captureRejections?: boolean;}} [opt]
 */
export function register(command, handler, opt) {
    let em = new EventEmitter(opt);
    commandRegistry[command] = em;
    handler(em);
}

export function exec(commandStr) {
    let args = commandStr.split(/\s+/g);

}

class Context {
    stack = [];

    constructor(obj, initializer) {
        this._savedData = initializer.call(this, obj);
    }

    add(data) {
        
    }
}