import { IToken } from '../core/index'
import { FormattingTypes } from './format'
import { genFuncPreview, genKey, genObjectMessage, genPartial } from './generator'
import { MultilineMessage } from './message'
import { Basic, ObjectProp } from './styles'

type Plugin = (t: IToken, m: MultilineMessage, f: FormattingTypes, pad: number) => void

export const objectField: Plugin = (t, m, f) => {
    const fields = t.children.filter(v => v.tokenType === 'field')

    for (const field of fields) {
        const fKey = field.children.find(v => v.tokenType === 'key')
        const fVal = field.children.find(v => v.tokenType === 'value')

        if (fKey && fVal) {
            m.addLine()
                .addText(genKey(fKey.content, false, f))
                .addBlock(': ', [ Basic.raw ])
                .addText(genPartial(fVal.content, 10, f))
        }
    }
}

export const instanceScope: Plugin = (t, m) => {
    const instanceCtorName = t.ctorName

    m.addLine()
        .addBlock(instanceCtorName, [ Basic.raw ])
        .nest()
}

export const arrayLike: Plugin = (t, m, f) => {
    const len = t.content?.length

    if (typeof len !== 'number') {
        return
    }

    const arr = t.content

    if (typeof arr !== 'object') {
        return
    }

    for (let i = 0; i < len; i++) {
        if (i in arr) {
            m.addLine()
                .addText(genKey(i, false, f))
                .addBlock(': ', [ Basic.raw ])
                .addText(genPartial(arr[i], 10, f))
        }
    }
}

export const entries: Plugin = (t, m, f) => {
    const el = t.content

    if (
        typeof t !== 'object' ||
        typeof el?.entries !== 'function' ||
        Array.isArray(el)
    ) {
        return
    }

    m.addLine()
        .addBlock('[[Entries]]', [ ObjectProp.prototype ])
        .nest()

    for (const [ k, v ] of el.entries()) {
        m.addLine()
            .addText(genKey(k, true, f))
            .addBlock(': ', [ Basic.raw ])
            .addText(genPartial(v, 10, f))
    }

    m.unnest()
}

export const getterSetter: Plugin = (t, m, f) => {
    const accessors = t.children.filter(v => v.tokenType === 'accessor')

    for (const accessor of accessors) {
        const tKey = accessor.children.find(t => t.tokenType === 'key')
        const tGetter = accessor.children.find(t => t.tokenType === 'getter')
        const tSetter = accessor.children.find(t => t.tokenType === 'setter')

        if (!tKey) {
            continue
        }

        if (tGetter) {
            m.addLine()
                .addBlock('get ', [ ObjectProp.setterGetter ])
                .addText(genFuncPreview(tGetter.content, f))
        }

        if (tSetter) {
            m.addLine()
                .addBlock('set ', [ ObjectProp.setterGetter ])
                .addText(genFuncPreview(tSetter.content, f))
        }
    }
}

export const accessor: Plugin = (t, m, f) => {
    const accessors = t.children.filter(v => v.tokenType === 'accessor')

    for (const accessor of accessors) {
        const tKey = accessor.children.find(t => t.tokenType === 'key')
        const tGetter = accessor.children.find(t => t.tokenType === 'getter')

        if (!tKey || !tGetter) {
            continue
        }

        let result = null
        let err = null
        try {
            result = tGetter.content.call(t.content)
        } catch (error) {
            err = null
        }

        m.addLine()
            .addBlock(tKey.content.toString(), [ accessor.enumerable ? ObjectProp.normal : ObjectProp.innenumerable ])
            .addBlock(': ', [ Basic.raw ])
            .addBlock(err ? `[${err}]` : genPartial(result, 10, f), [ Basic.raw ])
    }
}

export const accessorFromPrototype: Plugin = (t, m, f, root) => {
    const accessors = t.children.filter(v => v.tokenType === 'accessor')

    for (const accessor of accessors) {
        const tKey = accessor.children.find(t => t.tokenType === 'key')
        const tGetter = accessor.children.find(t => t.tokenType === 'getter')

        if (!tKey || !tGetter) {
            continue
        }

        let result = null
        let err = null
        try {
            result = tGetter.content.call(root)
        } catch (error) {
            err = null
        }

        m.addLine()
            .addBlock(tKey.content.toString(), [ accessor.enumerable ? ObjectProp.normal : ObjectProp.innenumerable ])
            .addBlock(': ', [ Basic.raw ])
            .addBlock(err ? `[${err}]` : genPartial(result, 10, f), [ Basic.raw ])
    }
}

export const prototypeEnumerableFields: Plugin = (t, m, f, p) => {
    const self = t.content
    let prototype = self

    while ((prototype = Object.getPrototypeOf(prototype)) !== Object.prototype) {
        const accessor = (t: IToken, m: MultilineMessage, f: FormattingTypes) => accessorFromPrototype(t, m, f, self)
        const message = genObjectMessage(prototype, [ accessor ], f, p)
            .trim()
            .replaceAll('\n', '\n' + ''.padStart(p, ' '))
        
        if (message) {
            m
            .addLine()
            .addText(message)
        }
    }
}