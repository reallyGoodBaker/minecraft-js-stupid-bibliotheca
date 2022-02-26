import {style} from './msgblock.js'

export const basic = {
    undefined: style('dark_blue'),
    boolean: style('dark_blue'),
    function: style('yellow'),
    number: style('aqua'),
    string: style('light_purple'),
    symbol: style('minecoin_gold')
}

export const objectProp = {
    preview: style('gray'),
    normal: style('blue'),
    prototype: style('dark_gray'),
    symbol: style('minecoin_gold')
}