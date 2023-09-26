import { parse } from "../core/index.js"
import { genPartial, genPartialArrayLike, genPartialEntries, genPartialIterable, genPreview } from "./generator.js"

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
}

let set = new Set([ 1, , 2, 3, 4, 'foo', 'bar' ])
let sym = Symbol('sym')

const tokens = parse({
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return set },
    get b() { return Math.random() },
    [sym]: () => 1,
})

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

const map = new Map()
    .set(obj1, 'cool')
    .set('ok', set)
    .set(set, obj1)


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

console.log(parse([
    1, [ 2, 3 ], 3, , 5,
]))

;[
    genPartial(async function foo() {}),
    genPartial(async () => {}),
    genPartial([ 1, 2, 3 ]),
    genPartial({}),
    genPartial(set),
    genPartial(obj1),
    genPartial('hello world!'),
    genPartial(Symbol('symbol')),
    genPartial([ 1, 1, 4, 5, 1, , 4 ]),
    genPartial(map),
    genPartial(set),
].forEach(el => {
    console.log(el)
})