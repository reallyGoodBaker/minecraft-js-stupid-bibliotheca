import {register} from './terminal.js'
import { mbf, style, getTab } from "./msgblock.js";
import { RawTeller } from "./sender.js";
import {TConsole} from './tconsole.js'

const UNTRUSTED_HEADER = 'Untrusted >';
const UNTRUSTED_HEADER_PREFIX = mbf(style('italic'), style('red'), UNTRUSTED_HEADER);

function sendUntrusted(msg, selector) {
    RawTeller.rawTeller.send(UNTRUSTED_HEADER_PREFIX + getTab() + msg, selector);
}

function send(msg, selector) {
    RawTeller.rawTeller.send(msg, selector);
}

const ConsoleSpecified = {
    '-o': 1,
    '-b': 0,
    '--open': 1,
    '--back': 0,
    '-p': 1
}

async function _openLogic(terminal, index, msgBuilder) {
    let data = terminal.get(index);
    let msg = await msgBuilder('normal', data);
    terminal.pushContext();

    send(msg);
}

async function _backLogic(terminal, msgBuilder) {
    if(!terminal.index) return;

    let data = terminal.clearContext();
    let msg = await msgBuilder('normal', data);

    send(msg);
}

class Context {
    data = null;
    previews = [];
    constructor(data, previews) {
        this.data = data;
        this.previews = previews;
    }
 }

export class ConsoleTerminal {
    static contexts = [];
    context  = null;
    index = 0;

    constructor(msgBuilder) {

        const openLogic = index => {
            _openLogic(this, index, msgBuilder);
        }

        const backLogic = () => {
            _backLogic(this, msgBuilder);
        }

        register('con', em => {
            em.on('-o', openLogic);
            em.on('--open', openLogic);
            em.on('-b', backLogic);
            em.on('--back', backLogic);
            em.on('-p', async data => sendUntrusted(await msgBuilder('normal', data)));

            em.on('unregister', () => {
                em.removeAllListeners('-o');
                em.removeAllListeners('--open');
                em.removeAllListeners('-b');
                em.removeAllListeners('--back');
                em.removeAllListeners('-p');
            })
        }, ConsoleSpecified);

        let arr = [];
        TConsole.__emitter__.on('--object', data => {
            this.context = new Context(data, [...arr]);
            //this.set(data);
            if(!ConsoleTerminal.contexts.length) this.pushContext();
        })

        TConsole.__emitter__.on('--preview', data => {
            arr.push(data);
            //this.add(data);
        })

    }

    clearContext() {
        ConsoleTerminal.contexts.length = this.index;
        this.index--;
        this.updateContext();
        return this.context.data;
    }

    pushContext() {
        this.index = ConsoleTerminal.contexts.length;
        ConsoleTerminal.contexts.push(this.context);
        this.updateContext();
    }

    updateContext() {
        this.context = ConsoleTerminal.contexts[this.index];
    }

    get(index=0) {
        return this.context.previews[index];
    }

}