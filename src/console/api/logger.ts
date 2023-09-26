import { genMessage, FormattingTypes } from '../display/index'

export let $ = {
    started: false,
    out: Function.prototype,
    err: Function.prototype,
}

type LoggerLevel = 'log' | 'info' | 'warn' | 'error'

interface LoggerOption {
    paddingSize: number
    format: FormattingTypes
}

const defaultLoggerOption: LoggerOption = {
    paddingSize: 2,
    format: FormattingTypes.ESCAPE_SEQ,
}

const outBuffer = []

export function printer(level: LoggerLevel, args: any, opt: LoggerOption = defaultLoggerOption) {
    let _args = Array.isArray(args) ? args : [ args ]

    if (!$.started) {
        outBuffer.concat(..._args)
        return
    }

    if (outBuffer.length) {
        _args = outBuffer.splice(0, outBuffer.length).concat(..._args)
    }

    for (const arg of _args) {
        $.out(
            genMessage(arg, opt.paddingSize, opt.format)
        )
    }
}

export function formatter(args: any[]) {

}

export function logger(level: LoggerLevel, ...args: any[]) {
    if (!args.length) {
        return
    }

    const [ first, ...rest ] = args

    if (!rest.length) {
        printer(level, first)
        return
    }

    printer(level, formatter(args))
}