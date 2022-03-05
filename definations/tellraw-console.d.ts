import {Dimension, Entity} from 'mojang-minecraft'
import { EventEmitter } from '../src/events';

declare type Commander = Dimension | Entity;

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
    getInstance(): TConsole;
    getConsole(): TellrawConsole;
    injectConsole(): void;

    showDetail(bool: boolean): void;
    tabSize(count: number): void;
    update(): void;
    selector(): string;
    selector(selector: string): void;
    on(type: string, handler: (...args: any[]) => void): TConsole;
    off(type: string, handler: (...args: any[]) => void): void;
}

export var initConsole: (commander: Commander, selector: string) => TConsole;