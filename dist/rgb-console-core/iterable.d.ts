import { IToken } from "./token.js";
interface ObjectWithEntries<K, V> {
    entries(): IterableIterator<[K, V]>;
}
export declare function parseIterable<T>(iterable: Iterable<T>): IToken;
export declare function parseEntries<K, V>(objWithEntries: ObjectWithEntries<K, V>): IToken;
export declare function parseArray<T>(arr: T[]): IToken;
export declare function parseSet<T>(collection: Set<T>): IToken;
export declare function parseMap<K, V>(map: Map<K, V>): IToken;
export {};
