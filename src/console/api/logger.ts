import { genMessage, FormattingTypes } from '../display/index'
import { findSpecifier, format } from './format'

type LoggerLevel = 'log' | 'info' | 'warn' | 'error'

interface LoggerOption {
    paddingSize: number
    format: FormattingTypes
}

const defaultLoggerOption: LoggerOption = {
    paddingSize: 2,
    format: FormattingTypes.ESCAPE_SEQ,
}

const outBuffer: any[] = []
const errBuffer: any[] = []

const schedule = globalThis.requestIdleCallback || globalThis.setTimeout || Function.prototype

const $start = () => {
    const handler = () => {
        const spliced = outBuffer.splice(0, outBuffer.length)

        for (const arg of spliced) {
            $.out(
                genMessage(arg, $.paddingSize, $.format)
            )
        }
    }

    const execute = () => schedule(() => {
        handler()
        execute()
    })

    $.started = true
    execute()
}

export let $ = {
    paddingSize: 2,
    format: FormattingTypes.ESCAPE_SEQ,
    started: false,
    start: $start,
    out: Function.prototype,
    err: Function.prototype,
}

export function printer(level: LoggerLevel, args: any, opt: LoggerOption = defaultLoggerOption) {
    let _args = Array.isArray(args) ? args : [ args ]

    if (level === 'error') {
        if (!$.started) {
            errBuffer.concat(..._args)
            return
        }
    
        if (errBuffer.length) {
            _args = errBuffer.splice(0, errBuffer.length).concat(..._args)
        }
    
        for (const arg of _args) {
            $.err(
                genMessage(arg, opt.paddingSize, opt.format)
            )
        }
    }

    outBuffer.push(..._args)
}

export function formatter(args: any[]) {
    if (
        args.length === 1 ||
        typeof args[0] !== 'string'
    ) {
        return args
    }

    let [ target, current ] = args
    let spec: string | null = null

    if ((spec = findSpecifier(target)) === null) {
        return args
    }

    target = format(target, spec, current, $.paddingSize, $.format)

    return formatter([target, ...args.slice(2)])
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