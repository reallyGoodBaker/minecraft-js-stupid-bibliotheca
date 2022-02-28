import { mbf, style, getTab } from "./msgblock.js";
import { RawTeller } from "./sender.js";

const UNTRUSTED_HEADER = '[Untrusted]';
const UNTRUSTED_HEADER_PREFIX = mbf(style('italic'), style('red'), UNTRUSTED_HEADER);

function sendUntrusted(msg, selector) {
    RawTeller.rawTeller.send(UNTRUSTED_HEADER_PREFIX + getTab() + msg, selector);
}

let commandRegistry = {};

export function register(command, opt) {
    commandRegistry[command] = opt;
}

export function exec(commandStr) {
    
}