import {EventEmitter} from '../events.js'
import {exec, register} from './terminal.js'

export class TConsole {
    static tConsole = null;
    static __emitter__ = new EventEmitter();
    static console = null;

    static showDetail = true;
    static tabSize = 2;

    getInstance(opt) {
        return TConsole.tConsole? TConsole.tConsole: TConsole.tConsole = new TConsole(opt);
    }

    constructor(opt) {
        this.console = opt.console;
        this.update = opt.update;
        this.register = register;
        this.exec = exec;
    }

    getConsole() {
        return this.console;
    }

    injectConsole() {
        let Global = typeof window !== 'undefined'? window:
            typeof global !== 'undefined'? global:
                typeof globalThis !== 'undefined'? globalThis:
                    typeof self !== 'undefined'? self: {};
    
        Global.console = this.console
    }

    showDetail(bool=true) {
        TConsole.showDetail = bool;
    }

    tabSize(count=2) {
        TConsole.tabSize = count;
    }

    update() {
        this.__update();
    }

    on(type, handler) {
        TConsole.__emitter__.on(type, handler);
    }

    off(type, handler) {
        TConsole.__emitter__.on(type, handler);
    }


}