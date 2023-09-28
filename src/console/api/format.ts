import {
    FormattingTypes, getDefaultPlugins, genMessage, genObjectMessage
} from '../display/index.js'

const specifiers = '%s,%d,%i,%f,%o,%O'.split(',')

export function findSpecifier(str: string) {
    for (const specifier of specifiers) {
        if (str.includes(specifier)) {
            return specifier
        }
    }

    return null
}

export function format(str: string, spec: string, arg: any, p: number, f: FormattingTypes) {
    let result: any = null

    switch (spec) {
        case '%s':
            result = String(arg)
            break
        
        case '%d':
        case '%i':
            result = typeof arg === 'symbol'
                ? NaN
                : parseInt(arg)
        
        case '%f':
            result = typeof arg === 'symbol'
                ? NaN
                : parseFloat(arg)
        
        case '%o':
            result = genMessage(arg, p, f)
        
        case '%O':
            result = genObjectMessage(arg, getDefaultPlugins(), f, p)
    }

    return str.replace(spec, result)
}