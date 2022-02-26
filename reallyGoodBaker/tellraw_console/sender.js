import {mbf, style} from './msgblock.js'

function fakeNativeToString(name, ...args) {
    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }`}
    return toString;
}

class RawTeller {
    sender = null;

    static header = '';
    
    constructor(header) {
        this.header = header || RawTeller.header;
    }

    send(msg, selector='@a[tag=debugger]') {
        this.sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${this.header} ${msg}"}]}`);
    }

    setSender(s) {
        this.sender = s;
    }

}

const untrustedHeader = mbf('', style('red'), '[Untrusted] ');

export class UntrustedRawTeller extends RawTeller {

    constructor(header) {
        super(header);

        this.send = this.sendUntrusted;
    }

    sendUntrusted(msg, selector='@a[tag=debugger]') {
        try {
            this.sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${untrustedHeader + msg}"}]}`);
        } catch (error) {
            this.onError.call(undefined, e, msg, selector);
        }
    }

    setSender(s) {
        this.sender = s;
    }

    onError(e) {
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

    let senderProxy = new Proxy(send, {
        get(t, p) {
            return t[p];
        },

        set() { return false }
    });

    return senderProxy;
}
