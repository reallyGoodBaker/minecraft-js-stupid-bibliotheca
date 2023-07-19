import { parseArray, parseEntries, parseIterable, parseMap, parseSet } from "./iterable.js"
import { getCtorName, parseObject } from "./object.js"
import { createToken } from "./token.js"

export function parse(o: any) {
    if (typeof o !== 'object') {
        return createToken(
            'primary', typeof o, getCtorName(o), o, null, []
        )
    }

    if (o instanceof Array) {
        return parseArray(o)
    }

    if (o instanceof Set) {
        return parseSet(o)
    }

    if (o instanceof Map) {
        return parseMap(o)
    }

    return safeParse(o)
}

function safeParse(obj: any) {
    try {
        if (typeof obj.entries === 'function') {
            return parseEntries(obj)
        } else throw Error()
    } catch (_) {
        try {
            if (typeof obj[Symbol.iterator] === 'function') {
                return parseIterable(obj)
            } else throw Error()
        } catch (error) {
            return parseObject(obj)
        }
    }
}