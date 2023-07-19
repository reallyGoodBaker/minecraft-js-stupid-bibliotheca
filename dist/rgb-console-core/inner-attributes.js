import { getCtorName } from "./object.js";
import { createToken } from "./token.js";
function innerAttrKeyVal(key, val, parent) {
    const fPair = createToken('inner', 'virtual', '', null, parent, [], false);
    fPair.children.push(createToken('key', 'string', 'String', `[[${key}]]`, fPair, [], false), createToken('value', typeof val, getCtorName(val), val, fPair, [], false));
    parent.children.push(fPair);
    return parent;
}
export function parsePrototype(obj, parent) {
    const proto = Object.getPrototypeOf(obj);
    const tProto = innerAttrKeyVal('Prototype', proto, parent);
    return tProto;
}
