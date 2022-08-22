import { EventEmitter } from '../events.js'

let commandRegistry = {};

/**
 * @param {string} command 
 * @param {(em: EventEmitter)=>void} handler 
 * @param {any} [opt]
 */
export function register(command, handler, opt = {}) {
    let em = new EventEmitter({ captureRejections: true });
    commandRegistry[command] = [em, opt];
    handler(em);
}

export function unregister(command) {
    commandRegistry[command][0].emit('unregister');
    delete commandRegistry[command]
}

export function exec(commandStr, onerror = () => null) {
    return new Promise(resolve => {
        let [commandResolver, ...args] = splitRegular(commandStr);
        const [em, opt] = commandRegistry[commandResolver];
        let shouldStopFlowing = false;

        em.on('error', onerror);
        em.once('error', () => {
            shouldStopFlowing = true;
            resolve(false)
        });

        em.emit('exec', ...args);
        if (shouldStopFlowing) return;

        let argCur;
        let unspecializedArgs = [];

        for (let i = 0; i < args.length;) {
            argCur = args[i];
            if (argCur.startsWith('-')) {
                let resCount = opt[argCur];
                if (resCount) {
                    let _args = args.slice(i + 1, i += resCount + 1);
                    em.emit(argCur, ..._args);
                } else {
                    em.emit(argCur);
                    i++;
                }
                if (shouldStopFlowing) return;
                continue;
            }

            i++;
            unspecializedArgs.push(argCur);
        }
        em.emit('default', ...unspecializedArgs);
        if (shouldStopFlowing) return;

        resolve(true);
        em.off('error', onerror);
    })
}

const states = {
    blank: 0,
    string: 1
}

/**
 * @param {string} str 
 */
function splitRegular(str) {
    str = str.trim();
    const len = str.length;
    let data = '';
    let res = [];
    let state = states.blank;

    for (let i = 0; i < len; i++) {
        const char = str[i];

        if (state === states.string && char === '"') {
            data += char;
            res.push(data);
            data = '';
            state = states.blank;
            continue;
        }

        if (state !== states.string && char === '"') {
            if (data) {
                res.push(data);
                data = '';
            }
            state = states.string;
            data += char;
            continue;
        }

        if (state === states.blank && char === ' ') {
            if (data) {
                res.push(data);
                data = '';
            }
        } else {
            if (char !== '"') {
                data += char;
            }
        }

        if (i === len - 1) {
            res.push(data);
            data = '';
        }
    }

    return res;
}
