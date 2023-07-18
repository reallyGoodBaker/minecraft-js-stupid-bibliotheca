export type PrimaryTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | 'virtual';
export type TokenTypes = 'key' | 'value' | 'field' | 'inst' | 'accessor' | 'getter' | 'setter' | 'item';
export interface IToken {
    readonly tokenType: TokenTypes;
    readonly basicType: PrimaryTypes;
    readonly ctorName: string;
    readonly content: any;
    readonly parent: IToken | null;
    readonly children: IToken[];
    readonly enumerable: boolean;
}
export declare function createToken(tokenType: TokenTypes, basicType: PrimaryTypes, ctorName: string, content: any, parent: IToken | null, children: IToken[], enumerable?: boolean): IToken;
