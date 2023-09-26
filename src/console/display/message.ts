import { FormattingTypes, style } from './format'
import { Basic, Style } from './styles'

export interface Message {
    toString(): string
}

export class StyledMessage implements Message {
    #style: string[] = [ ]
    #message: string[] = []
    #type: FormattingTypes

    constructor(formatting = FormattingTypes.ESCAPE_SEQ) {
        this.setFormattingTypes(formatting)
    }

    setFormattingTypes(type: FormattingTypes) {
        this.#type = type
    }

    #s(s: Style): string {
        return style(s, this.#type)
    }

    addStyle(style: Style) {
        const styleStr = this.#s(style)

        this.#style.push(styleStr)
        this.#message.push(styleStr)

        return this
    }

    popStyle(count = 1) {
        const styleStack = this.#style
        
        for (let i = 0; i < count; i++) {
            styleStack.pop()
        }

        if (!styleStack.length) {
            this.#message.push(this.#s(Basic.raw))
            return this
        }

        const currentStyle = styleStack[styleStack.length - 1]
        this.#message.push(currentStyle)

        return this
    }

    addText(t: string) {
        this.#message.push(t)

        return this
    }

    addBlock(txt: string, styles: Style[]) {
        const size = styles.length

        for (const style of styles) {
            this.addStyle(style)
        }

        this.addText(txt)
        this.popStyle(size)

        return this
    }

    toString() {
        return this.#message.join('')
    }
}

export class MultilineMessage extends StyledMessage {
    #nestedHierarchies = 0
    #paddingSize = 2

    constructor(
        format?: FormattingTypes,
        paddingSize?: number
    ) {
        super(format)

        paddingSize && (this.#paddingSize = paddingSize)
    }

    nest(hierarchy: number = 1) {
        this.#nestedHierarchies += hierarchy
        return this
    }

    unnest(hierarchy: number = 1) {
        this.#nestedHierarchies -= hierarchy
        return this
    }

    addLine() {
        this.addText(`\n${''.padStart(
            this.#nestedHierarchies * this.#paddingSize,
            ' '
        )}`)

        return this
    }
}