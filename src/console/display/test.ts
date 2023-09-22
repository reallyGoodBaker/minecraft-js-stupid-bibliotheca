import { parse } from "../core/index.js"

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
}

let sym = Symbol('sym')

const tokens = parse({
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return true },
    get b() { return Math.random() },
    [sym]: () => 1
})

console.log(tokens)