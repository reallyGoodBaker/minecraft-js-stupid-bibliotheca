export enum Basic {
    undefined = 'dark_blue',
    boolean = 'dark_blue',
    function = 'yellow',
    number = 'aqua',
    string = 'light_purple',
    symbol = 'minecoin_gold',
    cls = 'minecoin_gold',
    keywords = 'minecoin_gold',
    raw = 'white',
}

export enum ObjectProp {
    setterGetter = 'dark_green',
    innenumerable = 'green',
    preview = 'gray',
    normal = 'blue',
    prototype = 'dark_gray',
    symbol = 'minecoin_gold',
}

export enum TextStyle {
    bold = 'bold',
    italic = 'italic',
    reset = 'reset',
    obfuscated = 'obfuscated',
}

export type Style = Basic | ObjectProp | TextStyle