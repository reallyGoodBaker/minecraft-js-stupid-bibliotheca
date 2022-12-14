const selectorBasic = /@[asper](\[.*\])?/

const selectorProps = [
    'x', 'y', 'z',
    'r', 'rm',
    'dx', 'dy', 'dz',
    'scores', 'tag',
    'c', 'l', 'lm',
    'm', 'name',
    'rx', 'rxm',
    'ry', 'rym',
    'type', 'family',
]

function throwErr(msg) {
    throw Error(msg)
}

/**
 * @param {string} selector 
 * @returns 
 */
function validSelector(selector) {
    if (!selectorBasic.test(selector)) {
        throwErr('格式错误')
    }

    if (selector.length === 2) {
        return
    }

    selector = selector.slice(2)
    let conditionStr
    if ((conditionStr = selector.replace(/\[(.*)\]/, '$1')) !== selector.replace(/\[(.*?)\]/, '$1')) {
        throwErr('格式错误')
    }

    for (const expr of conditionStr.split(',')) {
        if (!expr) {
            throwErr(`选择器格式错误`)
        }

        const [prop, val] = expr.split('=')

        validValue(prop, val)
    }

}

const defaultValueMatcher = /!?[\w]+/
    , tagValueMatcher = /!?[\w]*/
    , defaultValueValider = (prop, val, matcher=defaultValueMatcher) => {
        if (!matcher.test(val)) {
            throwErr(`"${prop}" 选择器的值格式错误`)
        }
    }

function validValue(prop, val) {
    if (!selectorProps.includes(prop)) {
        throwErr(`未知的选择器: ${prop}`)
    }

    if (prop === 'tag') {
        return defaultValueValider(prop, val, tagValueMatcher)
    }

    if (prop === 'scores') {
        return validScore(prop, val)
    }

    return defaultValueValider(prop, val)
}

function validScore(prop, val) {
    let scoreObj = null

    return true
}

validSelector('@p[name=ok,tag=!,scores={foo=1..10}]')