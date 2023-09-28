import { $, logger } from './logger'

export function createConsole(err: Function, out?: Function) {
    out ??= err

    $.err = err
    $.out = out

    const _console = {
        log: (...args: any[]) => logger('log', ...args),
        info: (...args: any[]) => logger('info', ...args),
        warn: (...args: any[]) => logger('warn', ...args),
        error: (...args: any[]) => logger('error', ...args),
    }

    $.start()

    return _console
}

export function injectConsole(err: Function, out?: Function) {
    //@ts-ignore
    globalThis.console = createConsole(err, out)
}