import { parse } from "../core/index.js"
import { accessor, arrayLike, entries, getterSetter, instanceScope, objectField, prototypeEnumerableFields } from "./addons.js"
import { genObjectMessage, genPartial, genPartialArrayLike, genPartialEntries, genPartialIterable, genPreview } from "./generator.js"

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
}

let set = new Set([ 1, , 2, 3, 4, 'foo', 'bar' ])
let sym = Symbol('sym')
const obj2 = {
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return set },
    get b() { return Math.random() },
    [sym]: () => 1,
}

// console.log(genFuncPreview(async function foo() {}))
// console.log(getFuncSign(async () => {}))
// console.log(genKey(tokens.content, true))

// console.log(
//     genComplexPreview([ 1, 2, 3 ]),
//     genComplexPreview({}),
//     genComplexPreview(obj1)
// )

// console.log(
//     genComplexPreview(set),
// )

// const map = new Map()
//     .set(obj1, 'cool')
//     .set('ok', set)
//     .set(set, obj1)


// ;[
//     genPreview(async function foo() {}),
//     genPreview(async () => {}),
//     genPreview([ 1, 2, 3 ]),
//     genPreview({}),
//     genPreview(set),
//     genPreview(obj1),
//     genPreview('hello world!'),
//     genPreview(Symbol('symbol')),
//     genPartialIterable([ 1, 1, 4, 5, 1, , 4 ]),
//     genPartialArrayLike([ 1, 1, 4, 5, 1, , 4 ]),
//     genPartialEntries(map),
//     genPartialEntries(set),
// ].forEach(el => {
//     console.log(el)
// })

// console.log(parse([
//     1, [ 2, 3 ], 3, , 5,
// ]))

// ;[
//     genPartial(async function foo() {}),
//     genPartial(async () => {}),
//     genPartial([ 1, 2, 3 ]),
//     genPartial({}),
//     genPartial(set),
//     genPartial(obj1),
//     genPartial('hello world!'),
//     genPartial(Symbol('symbol')),
//     genPartial([ 1, 1, 4, 5, 1, , 4 ]),
//     genPartial(map),
//     genPartial(set),
// ].forEach(el => {
//     console.log(el)
// })

// const plugins = [
//     instanceScope,
//     arrayLike,
//     entries,
//     objectField,
//     accessor,
//     prototypeEnumerableFields,
//     getterSetter,
// ]

// ;[
//     genObjectMessage(obj1, plugins),
//     genObjectMessage([ 1, 1, 4, 5, 1, , 4 ], plugins),
//     genObjectMessage([ 1, 1, 4, 5, 1, [ 1, 1, 4, 5, 1, { a: 1 }, 4 ], 4 ], plugins),
//     genObjectMessage('hello world', plugins),
//     genObjectMessage(set, plugins),
//     genObjectMessage(map, plugins),
//     genObjectMessage(obj2, plugins),
// ].forEach(el => {
//     console.log(el)
// })

// const div = document.createElement('div')

// ;[
//     genObjectMessage(div, plugins),
// ].forEach(el => {
//     console.log(el)
// })

// console.log('%O', div)

// class A {
//     a = 1

//     get b() {
//         return 1
//     }

//     get foo() {
//         return false
//     }
// }

// class B extends A {}

// const b = new B()

// console.log(b)

// ;[
//     genObjectMessage(b, plugins),
// ].forEach(el => {
//     console.log(el)
// })