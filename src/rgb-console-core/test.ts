import { parseObject } from "./object.js"

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
}

let sym = Symbol('sym')
const obj2 = {
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return true },
    get b() { return Math.random() },
    [sym]: () => 1
}

Object.defineProperty(obj2, sym, {
    get() {
        return '?'
    }
})

console.log(parseObject(obj1))
console.log(parseObject(obj2))