import {mbf, style} from './msgblock.js'

function fakeNativeToString(name, ...args) {
    function toString() { return `function ${name}(${args.join(', ')}) { [native code] }`}
    return toString;
}

export class RawTeller {
    static sender = null;
    /**
     * @type {[string, string, any][]}
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

    send(msg, selector='@a[tag=debugger]') {
        this.msgQueue.push([selector, msg, RawTeller.sender]);
    }

    pend() {
        this.pending = true;
    }

    active() {
        if (this.pending) return;

        this.msgQueue.forEach(msg => {
            const [selector, message, sender] = msg;
            sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${this.header} ${message}"}]}`);
        });

        this.msgQueue = [];
    }

    setSender(s) {
        RawTeller.sender = s;
    }

}

// const untrustedHeader = mbf('', style('red'), '[Untrusted] ');

// export class UntrustedRawTeller extends RawTeller {

//     constructor(header) {
//         super(header);

//         this.send = this.sendUntrusted;
//     }

//     sendUntrusted(msg, selector='@a[tag=debugger]') {
//         try {
//             this.sender.runCommand(`tellraw ${selector} {"rawtext": [{"text": "${untrustedHeader + msg}"}]}`);
//         } catch (error) {
//             this.onError.call(undefined, e, msg, selector);
//         }
//     }

//     setSender(s) {
//         this.sender = s;
//     }

//     onError(e) {
//     }

// }

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
