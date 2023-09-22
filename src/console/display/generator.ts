
import {
    getCtorName
} from '../core/index.js'

import { FormattingTypes } from './format.js'
import { StyledMessage } from './message.js'
import { Basic, ObjectProp } from './styles.js'

export function genKey(k: any, fullTypes = false, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    let message = new StyledMessage(format)

    if (fullTypes) {
        if (typeof k === 'object' && ('size' in k || 'length' in k)) {
            return message
                .addStyle(ObjectProp.normal)
                .addText(getCtorName(k) + '(')
                .addBlock(k.size ?? k.length, [ Basic.number ])
                .addText(')')
                .toString()
        }

        return message
            .addText(genPreview(k, format))
            .toString()
    }

    if (typeof k === 'symbol') {
        message.addStyle(ObjectProp.symbol)
    } else {
        message.addStyle(ObjectProp.normal)
    }

    message.addText(k.toString())

    return message.toString()
}

export function genGeneric(obj: any, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    let message = new StyledMessage(format)

    switch (typeof obj) {
        case 'bigint':
        case 'number':
            return message
                .addBlock(obj.toString(), [ Basic.number ])
                .toString()

        case 'boolean':
        case 'undefined':
            return message
                .addBlock(`${obj}`, [ Basic.undefined ])
                .toString()
        
        case 'string':
            return message
                .addBlock(`'${obj}'`, [ Basic.string ])
                .toString()
        
        case 'symbol':
            return message
                .addBlock(obj.toString(), [ Basic.symbol ])
                .toString()

        default:
            return ''
    }
}

export function getFuncSign(func: Function) {
    let fstr = func.toString()
    let anonymous = true
    let asyncSign = fstr.startsWith('async')

    if (asyncSign) {
        fstr = fstr.slice(5).trim()
    }

    if (func.name) {
        const end = fstr.indexOf(')')

        anonymous = false
        fstr = fstr.slice(8, end + 1)
            .trim()
    }

    return {
        async: asyncSign,
        sign: fstr,
        anonymous,
    }
}

export function genFuncPreview(func: Function, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    const {
        async: isAsync,
        sign: funcSign,
        anonymous,
    } = getFuncSign(func)

    let message = new StyledMessage(format)

    if (isAsync) {
        message.addBlock('async ', [ Basic.function ])
    }

    if (!anonymous) {
        message.addBlock('f ', [ Basic.function ])
    }

    message.addText(funcSign)

    return message.toString()
}

export function genComplexPreview(o: any, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    const ctorName = getCtorName(o)
    const message = new StyledMessage(format)

    if (ctorName === 'Object') {
        const preview = Reflect.ownKeys(o).length ? '{...}' : '{}'

        return message
            .addText(preview)
            .toString()
    }

    if (ctorName === 'Array') {
        if (o.length > 0) {
            return message
                .addStyle(Basic.raw)
                .addText('[...')
                .addBlock(o.length, [ Basic.number ])
                .addText(']')
                .toString()
        }

        return message
            .addBlock('[]', [ Basic.raw ])
            .toString()
    }

    if ('size' in o || 'length' in o) {
        return message
            .addStyle(Basic.raw)
            .addText(getCtorName(o) + '(')
            .addBlock(o.size ?? o.length, [ Basic.number ])
            .addText(')')
            .toString()
    }

    return message
        .addBlock(getCtorName(o), [ Basic.raw ])
        .toString()
}

export function genPreview(o: any, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    const objType = typeof o

    if (objType === 'function') {
        return genFuncPreview(o, format)
    }

    if (objType === 'object') {
        return o ? genComplexPreview(o, format)
            : new StyledMessage(format)
                .addBlock('null', [ Basic.undefined ])
                .toString()
    }

    return genGeneric(o, format)
}

export function genFunc(func: Function) {
    return func.toString()
}

export function genPartialArrayLike(arr: ArrayLike<any>, maxItemCount=10, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format)
    const arrCtorName = getCtorName(arr)
    const isArray = arrCtorName === 'Array'

    message
        .addStyle(Basic.raw)
        .addText((isArray ? '' : arrCtorName) + '(')
        .addBlock(arr.length.toString(), [ Basic.number ])
        .addText(`) ${isArray ? '[' : '{'}`)

    for (let count = 0; count < arr.length; count++) {
        const item = arr[count]

        if (count === maxItemCount) {
            message.addText(', ...')
            break
        }

        if (count) {
            message.addBlock(', ', [ Basic.raw ])
        }

        if (count in arr) {
            message.addText(genPreview(item, format))
        } else {
            message.addBlock('empty', [ ObjectProp.prototype ])
        }
    }

    return message
        .addText(isArray ? ']' : '}')
        .toString()
}

export function genPartialIterable(it: Iterable<any>, maxItemCount=10, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    const message = new StyledMessage(format)

    let count = 0

    message
        .addStyle(Basic.raw)
        .addText(getCtorName(it) + ' {')

    for (const item of it) {
        if (count === maxItemCount) {
            message.addText(', ...')
            break
        }

        if (count) {
            message.addBlock(', ', [ Basic.raw ])
        }

        count++
        message.addText(genPreview(item, format))
    }

    return message
        .addText('}')
        .toString()
}

export function genPartialEntries(
    e: { entries(): IterableIterator<[any, any]> },
    maxItemCount=10,
    format: FormattingTypes = FormattingTypes.ESCAPE_SEQ
) {
    const message = new StyledMessage(format)

    let count = 0

    message
        .addStyle(Basic.raw)
        .addText(getCtorName(e) + ' {')

    for (const [ k ,v ] of e.entries()) {
        if (count === maxItemCount) {
            message.addText(', ...')
            break
        }

        if (count) {
            message.addBlock(', ', [ Basic.raw ])
        }

        message
            .addText(genKey(k, true, format))
            .addBlock(' => ', [ Basic.raw ])
            .addText(genPreview(v, format))

        count++
    }

    return message
        .addText('}')
        .toString()
}

export function genPartialObject(
    o: any,
    maxItemCount=10,
    format: FormattingTypes = FormattingTypes.ESCAPE_SEQ
) {
    const message = new StyledMessage(format)

    let count = 0

    message
        .addStyle(Basic.raw)
        .addText(getCtorName(o) + ' {')

    for (const [ k ,v ] of Object.entries(o)) {
        if (count === maxItemCount) {
            message.addText(', ...')
            break
        }

        if (count) {
            message.addBlock(', ', [ Basic.raw ])
        }

        message
            .addText(genKey(k, false, format))
            .addBlock(': ', [ Basic.raw ])
            .addText(genPreview(v, format))

        count++
    }

    return message
        .addText('}')
        .toString()
}

export function genPartial(o: any, maxItemCount=10, format: FormattingTypes = FormattingTypes.ESCAPE_SEQ) {
    if (typeof o === 'object') {
        if (typeof o.length === 'number') {
            return genPartialArrayLike(o, maxItemCount, format)
        }
    
        if (
            typeof o[Symbol.iterator] === 'function' &&
            !(o instanceof Map)
        ) {
            return genPartialIterable(o, maxItemCount, format)
        }

        if (typeof o.entries === 'function') {
            return genPartialEntries(o, maxItemCount, format)
        }
    
        if (o !== null) {
            return genPartialObject(o, maxItemCount, format)
        }
    }

    return genPreview(o, format)
}
