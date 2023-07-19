import { printer } from "./quick-printer.js";
const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
};
let sym = Symbol('sym');
const obj2 = {
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return true; },
    get b() { return Math.random(); },
    [sym]: () => 1
};
Object.defineProperty(obj2, sym, {
    get() {
        return '?';
    }
});
const arr = [1, 2, 3, , 4];
const s = new Set(arr);
const map = new Map();
map.set('foo', 'bar');
map.set(s, 'cool');
map.set('s', s);
// console.log(parseObject(obj1))
// console.log(parseObject(obj2))
// console.log(parseArray(arr), parseIterable(arr), parseEntries(arr))
// console.log(parseSet(s))
// console.log(parseMap(map))
printer.print(1);
printer.print('wow');
printer.print(obj1);
printer.print(obj2);
printer.print(arr);
printer.print(s);
printer.print(map);
