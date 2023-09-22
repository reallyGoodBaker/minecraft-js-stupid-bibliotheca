export enum FormattingTypes {
    MINECRAFT,
    ESCAPE_SEQ,
}

export const Formatting = {
    black: "§0",
    dark_blue: "§1",
    dark_green: "§2",
    dark_aqua: "§3",
    dark_red: "§4",
    dark_purple: "§5",
    gold: "§6",
    gray: "§7",
    dark_gray: "§8",
    blue: "§9",
    green: "§a",
    aqua: "§b",
    red: "§c",
    light_purple: "§d",
    yellow: "§e",
    white: "§f",
    minecoin_gold: "§g",
    obfuscated: "§k",
    bold: "§l",
    italic: "§o",
    reset: "§r",
}

export const FormattingANSLEscapeSequences = {
    black: "\x1b[30m",
    dark_blue: "\x1b[34m",
    dark_green: "\x1b[32m",
    dark_aqua: "\x1b[36m",
    dark_red: "\x1b[31m",
    dark_purple: "\x1b[35m",
    dark_gray: "\x1b[90m",
    gold: "\x1b[93m",
    gray: "\x1b[37m",
    blue: "\x1b[94m",
    green: "\x1b[92m",
    aqua: "\x1b[96m",
    red: "\x1b[91m",
    light_purple: "\x1b[95m",
    yellow: "\x1b[33m",
    white: "\x1b[97m",
    minecoin_gold: "\x1b[93m",
    obfuscated: "\x1b[7m",
    bold: "\x1b[1m",
    italic: "\x1b[3m",
    reset: "\x1b[0m",
};

export function style(key: string, format=FormattingTypes.ESCAPE_SEQ) {
    return format === FormattingTypes.MINECRAFT ? Formatting[key]
        : FormattingANSLEscapeSequences[key]
}


export const IconSymbol = {
}

export const Formatter = {
}
