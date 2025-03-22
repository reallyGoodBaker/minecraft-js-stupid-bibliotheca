import { logger, $ } from './index.js'

$.start()
$.out = v => console.log(v)

const obj1 = {
    a: 'cool',
    b: 1,
    c: 'good'
}

let array = [ 1, ,, 2, 3, 4, 'foo', 'bar' ]
let set = new Set(array)
let sym = Symbol('sym')

const obj2 = {
    [Symbol()]: 'wow, symbol!',
    obj1,
    get a() { return set },
    get b() { return Math.random() },
    [sym]: () => 1,
    arr: array,
    ok() {},
}

obj2.self = obj2

logger('log', obj2)
logger('log', {
    foo() {
        return 'bar'
    }
})