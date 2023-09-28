// import { $, logger, printer } from './logger'

// $.out = v => console.log(v)
// $.start()

// const obj1 = {
//     a: 'cool',
//     b: 1,
//     c: 'good'
// }

// let set = new Set([ 1, , 2, 3, 4, 'foo', 'bar' ])
// let sym = Symbol('sym')
// const obj2 = {
//     [Symbol()]: 'wow, symbol!',
//     obj1,
//     get a() { return set },
//     get b() { return Math.random() },
//     [sym]: () => 1,
// }

// printer('error', [
//     obj2,
//     obj1,
//     set,
//     'Hello World',
//     114.514,
// ])

// logger('log', 'Hello %s, %o', 'World', obj1)

import { injectConsole } from './wrapper'

injectConsole(console.error, console.log)

console.log({
    foo: 'bar'
})
