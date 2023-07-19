import { IToken } from "./token.js";
declare class Printer {
    print(obj: any): void;
    traverse(parent: IToken, handler: (t: IToken) => void): void;
    preview(obj: any): any;
}
export declare const printer: Printer;
export {};
