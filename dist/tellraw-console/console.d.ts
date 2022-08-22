import { EventEmitter } from 'events';

declare type Receiver = (msg: string) => void

interface TTerminal {
    register(command: string, handler: (em: EventEmitter) => void, opt?: any): void;
    unregister(command: string): void;
    exec(commandString: string, onerror: (err: Error) => void): Promise<boolean>;
}

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

interface TConsole extends TTerminal{
    getConsole(): TellrawConsole;
    injectConsole(): void;
    setFormatting(type: 'minecraft'|'ansiEscapeSeq'): void
    showDetail(bool: boolean): void;
    tabSize(count: number): void;
    update(): void;
    on(type: string, handler: (...args: any[]) => void): TConsole;
    off(type: string, handler: (...args: any[]) => void): void;
}

export var initConsole: (receiver: Receiver) => TConsole;