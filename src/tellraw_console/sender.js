import {TConsole} from './tconsole.js'

function fakeNativeToString(name, ...args) {
    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }`}
    return toString;
}

export class RawTeller {
    static sender = null;
    /**
     * @type {[string, string][]}
     */
    msgQueue = [];
    pending = false;

    static header = '';
    /**
     * @type {RawTeller}
     */
    static rawTeller;
    
    constructor(header) {
        this.header = header || RawTeller.header;
        RawTeller.rawTeller = this;
    }

    send(msg, selector=TConsole.selector) {
        this.msgQueue.push([selector, msg]);
    }

    pend() {
        this.pending = true;
    }

    active() {
        if (this.pending) return;

        this.msgQueue.forEach(msg => {
            const [selector, message] = msg;
            RawTeller.sender(`tellraw ${selector} {"rawtext": [{"text": "${this.header}${message}"}]}`);
        });

        this.msgQueue = [];
    }

    setSender(func) {
        RawTeller.sender = func;
    }

}

/**
 * @param {any} commander 
 * @returns {Function}
 */
export function getRawTeller(commander) {

    let sender = new RawTeller();
    sender.setSender(commander);

    function send(msg, selector) {
        sender.send(msg, selector);
    }

    send.toString = fakeNativeToString('send', 'msg', 'selector');

    send.update = () => {
        sender.active();
    }

    let senderProxy = new Proxy(send, {
        get(t, p) {
            return t[p];
        },

        set() { return false }
    });

    return senderProxy;
}
