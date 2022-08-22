import { EventEmitter } from '../events.js'
import { exec, register, unregister } from './terminal.js'
import { setFormatting } from '../format'

export class TConsole {
    static tConsole = null;
    static __emitter__ = new EventEmitter();
    static console = null;

    static showDetail = true;
    static tabSize = 2;

    constructor(opt) {
        this.console = opt.console;
        this.update = opt.update;
        this.unregister = unregister;
        this.register = register;
        this.exec = exec;
        (function () {
            TConsole.tConsole = this;
        })()
    }

    getConsole() {
        return this.console;
    }

    injectConsole() {
        let Global = typeof window !== 'undefined' ? window :
            typeof global !== 'undefined' ? global :
                typeof globalThis !== 'undefined' ? globalThis :
                    typeof self !== 'undefined' ? self : {};

        Global.console = this.console
    }

    showDetail(bool = true) {
        TConsole.showDetail = bool;
    }

    tabSize(count = 2) {
        TConsole.tabSize = count;
    }

    /**
     * @param {'minecraft'|'ansiEscapeSeq'} type 
     */
    setFormatting(type) {
        setFormatting(type)
    }

    update() { }

    on(type, handler) {
        TConsole.__emitter__.on(type, handler);
        return this;
    }

    off(type, handler) {
        TConsole.__emitter__.on(type, handler);
    }


}