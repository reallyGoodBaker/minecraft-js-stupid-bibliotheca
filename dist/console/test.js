import { logger, $ } from './index.js'

$.started = true
$.out = v => console.log(v)

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

logger('log', obj2)
