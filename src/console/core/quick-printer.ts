import { getCtorName } from "./object.js"
import { parse } from "./parse.js"
import { IToken, createToken } from "./token.js"

type Writable = {
    write(msg: string): void
}

export class Printer {
    #out: Writable | null = null

    print(obj: any) {
        const data = parse(obj)
        const root = createToken(
            'inst', 'virtual', '', null, null, [data]
        )
        let str = ''

        const handler = (t: IToken) => {
            if (t.tokenType === 'inst') {
                str += `${t.ctorName}\n`
                this.traverse(t, handler)
            }
            if (t.tokenType === 'field' || t.tokenType === 'inner') {
                const k = t.children.find(v => v.tokenType === 'key')
                const v = t.children.find(v => v.tokenType === 'value')
                str += `${this.previewKey(k?.content)}: ${this.preview(v?.content)}\n`
            }
            if (t.tokenType === 'primary') {
                str += t.content.toString()
            }
            if (t.tokenType === 'item') {
                str += (t.basicType === 'empty' ? 'empty': t.content) + ', '
            }
            if (t.tokenType === 'entry') {
                const k = t.children.find(v => v.tokenType === 'key')
                const v = t.children.find(v => v.tokenType === 'value')
                str += `${this.previewKey(k?.content, true)} => ${this.preview(v?.content)}\n`
            }
            if (t.tokenType === 'accessor') {
                this.traverse(t, handler)
            }
            if (t.tokenType === 'getter' || t.tokenType === 'setter') {
                let name = t.content.name

                if (name === 'get' && t.parent) {
                    const key = t.parent.children.find(v => v.tokenType === 'key')
                    name = 'get ' + key?.content.toString()
                }

                str += `${name ?? 'anonymous'}()\n`
            }
        }

        this.traverse(root, handler)

        this.#out?.write(str)
    }

    traverse(parent: IToken, handler: (t: IToken) => void) {
        for (const t of parent.children) {
            handler.call(null, t)
        }
    }

    previewKey(obj: any, fullTypesRefer=false) {
        if (['string', 'number', 'symbol'].includes(typeof obj)) {
            return obj.toString()
        }

        if ('size' in obj || 'length' in obj) {
            return getCtorName(obj) + `(${obj.size ?? obj.length})`
        }

        return getCtorName(obj)
    }

    preview(obj: any) {
        if (typeof obj === 'string') {
            return `'${obj}'`
        }

        if (['number', 'boolean', 'bigint', 'function', 'symbol'].includes(typeof obj)) {
            return obj.toString()
        }

        if (typeof obj.length === 'number') {
            return `${getCtorName(obj)}(${obj.length})`
        }

        if (typeof obj.constructor === 'function') {
            return obj.constructor.name
        }

        if (obj.size) {
            return `${getCtorName(obj)}(${obj.size})`
        }

        if (typeof obj === 'object') {
            return `${getCtorName(obj)} {...}`
        }

        return obj.toString()
    }

    constructor(outStream?: Writable) {
        if (outStream) {
            this.#out = outStream
        }

        if ('console' in globalThis) {
            this.#out = {
                write(msg) {
                    //@ts-ignore
                    globalThis.console.log(msg)
                },
            }
        }
    }
}