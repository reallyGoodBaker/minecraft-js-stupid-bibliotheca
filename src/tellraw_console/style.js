import { style } from '../format.js'

function proxify(obj) {
    return new Proxy(obj, {
        get(t, p) {
            return style(t[p])
        },
        set() {
            return false
        }
    })
}

export const basic = proxify({
    undefined: 'dark_blue',
    boolean: 'dark_blue',
    function: 'yellow',
    number: 'aqua',
    string: 'light_purple',
    symbol: 'minecoin_gold'
})

export const objectProp = proxify({
    setterGetter: 'dark_green',
    innenumerable: 'green',
    preview: 'gray',
    normal: 'blue',
    prototype: 'dark_gray',
    symbol: 'minecoin_gold'
})
