import {EventEmitter} from '../events.js'
import {exec, register, unregister} from './terminal.js'

export class TConsole {
    static tConsole = null;
    static __emitter__ = new EventEmitter();
    static console = null;

    static showDetail = true;
    static tabSize = 2;
    static defaultSelector = '@a[tag=debugger]';
    static selector = TConsole.defaultSelector;

    getInstance(opt) {
        return TConsole.tConsole? TConsole.tConsole: new TConsole(opt);
    }

    constructor(opt, selector) {
        this.console = opt.console;
        this.update = opt.update;
        this.unregister = unregister;
        this.register = register;
        this.exec = exec;
        TConsole.tConsole = this;
        this.selector(selector);
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

    update() {}

    selector(selector) {
        if(!selector) return TConsole.selector;
        TConsole.selector = selector;
    }

    on(type, handler) {
        TConsole.__emitter__.on(type, handler);
        return this;
    }

    off(type, handler) {
        TConsole.__emitter__.on(type, handler);
    }


}