export type PrimaryTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | 'virtual' | 'empty'

export type TokenTypes = 'key' | 'value' | 'field' | 'inst' | 'accessor' | 'getter' | 'setter' | 'item' | 'entry' | 'inner' | 'primary'

export interface IToken {
    readonly tokenType: TokenTypes
    readonly basicType: PrimaryTypes
    readonly ctorName: string
    readonly content: any
    readonly parent: IToken | null
    readonly children: IToken[]
    readonly enumerable: boolean
}

export function createToken(
    tokenType: TokenTypes,
    basicType: PrimaryTypes,
    ctorName: string,
    content: any,
    parent: IToken | null,
    children: IToken[],
    enumerable: boolean = true
): IToken {
    return {
        tokenType, basicType, ctorName, parent, children, content, enumerable
    }
}