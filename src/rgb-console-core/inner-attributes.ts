import { getCtorName } from "./object.js"
import { IToken, createToken } from "./token.js"

function innerAttrKeyVal(key: string, val: any, parent: IToken) {
    const fPair = createToken(
        'inner', 'virtual', '', null, parent, [], false
    )

    fPair.children.push(
        createToken('key', 'string', 'String', `[[${key}]]`, fPair, [], false),
        createToken('value', typeof val, getCtorName(val), val, fPair, [], false),
    )

    parent.children.push(fPair)
    return parent
}

export function parsePrototype(obj: any, parent: IToken) {
    const proto = Object.getPrototypeOf(obj)
    const tProto = innerAttrKeyVal('Prototype', proto, parent)

    return tProto
}
