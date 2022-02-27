import {Dimension, Entity} from 'mojang-minecraft'

declare type Commander = Dimension | Entity;

interface TellrawConsole {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    trace(): void;
    assert(condition: boolean, ...data: any[]): void;
    count(label?: any): void;
    countReset(label?: any): void;
    updateTimer(): void;
    time(label?: any): void;
    timeLog(label?: any): void;
    timeEnd(label?: any): void;
}

interface ConsoleModule {
    console: TellrawConsole;
    update(): void;
}

export var initConsole: (commander: Commander, selector: string) => ConsoleModule;
export var injectConsole: (commander: Commander, selector: string) => () => void;