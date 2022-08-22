# TellrawConsole for minecraft

# 快速上手

如果你是从 `MineBBS`  跳转到此处的，请先拉到 <a href="#兼容-CommonJS">最下面</a>

## 1. 注入 `console`

```js
//main.js

import {initConsole} from './console.js'
import {world} from 'mojang-minecraft'

const mcPrint = msg => {
    world.getDimension('overworld').runCommand(`/tellraw @a[tag=debugger] {"rawtext":[{"text":"${msg}"}]}`)
}

const tConsole = initConsole(mcPrint);
tConsole.injectConsole(); //将 console 注入全局环境

world.events.tick.subscribe(() => tConsole.update()); //每 tick 更新一次 console 的状态
//由于 console 的推送基于消息队列，此函数是消息队列的执行函数, 所以不执行这个函数就不会看到任何东西

console.log({
    foo: "Hello",
    bar: "World",
})//试试console吧！
```

## 2. 使用  `TConsole.exec`

为了避免循环引用和适当提高性能，`TConsole` 将会把子层级的可展开对象折叠输出, (例如: `Object { ... }`) 折叠输出的可展开对象一般会用 `$数字` 标记， 若你想快速打印子层级的对象，可以使用 `TConsole` 自带的一个指令 `con`

```js
//main.js

console.log({
    arr: ['Hello', 'World'],
    obj: {a: 1}
});

/* 
 * Object { ... }
 * arr: (2)['Hello', 'World']  $0
 * obj: Object { ... }  $1
 * [[Prototype]]: Object
 */
// arr 的标记是 $0, obj 的标记是 $1

tConsole.exec('con --open 0');// 展开 $0

/* 
 * Array(2)
 * 0: 'Hello'
 * 1: 'World'
 * length: 2
 * [[Prototype]]: Array
 */
```

当使用  `--open` (或 `-o` ) 展开一个对象后，你的上下文发生了改变，此时  `$0` 所指的对象不再是被展开的对象，而是被展开对象的第一个可展开的属性，如果你想打印父对象的其他属性，请使用 `-b` 或者 `--back` 退回之前的上下文

```js
//main.js

tConsole.exec('con -b')// 退回之前的上下文

/* 
 * Object { ... }
 * arr: (2)['Hello', 'World']  $0
 * obj: Object { ... }  $1
 * [[Prototype]]: Object
 */

tConsole.exec('con -o 1')// 展开$1

/* 
 * Object { ... }
 * a: 1
 * [[Prototype]]: Object
 */
```

这就是快速上手的全部内容了，若你想知道更多的细节，请往下看~

# 输入与输出

TellrawConsole 的输入与输出都过于简单，所以并没有写成标准输入输出的形态，但：

```ts
initConsole(receiver: (message: string) => void): TConsole
```

中的  `recevier`  可以看成输出。

```ts
TConsole.prototype.exec(cmd: string, onerror: (err: any) => void): Promise<boolean>
```

可以看成输入。

# 拓展

`TTerminal`  类为  `TConsole`  提供了类似控制台处理命令的能力，例：

```js
// ... 你的代码
const tConsole = initConsole(mcPrint);
// ... 你的代码
tConsole.register('test', () => {
    console.log('This is a test')
})

tConsole.exec('test')//This is a test
```

如果你要处理多参数的指令，就需要   `启动子`  (随便编的名字，别在意)，它的作用是在指令中标记出一个数组作为使用  `启动子`  名称注册的事件（事件监听器）的参数。例：

```js
// ... 你的代码
const tConsole = initConsole(mcPrint);
// ... 你的代码
tConsole.register('test', em => {
    em.on('foo', arg => {
        console.log(`Received: ${arg}`)
    })

    em.on('bar', (arg1, arg2) => {
        console.log(arg1 + arg2)
    })
}, {
    '-foo': 1, //告诉程序 -foo 启动子后面1个数据是事件"foo"的参数
    '-bar': 2  //告诉程序 -bar 启动子后面2个数据是事件"bar"的参数
})

tConsole.exec('test -foo bar -bar "I am " ikun')
//输出:
//Received: bar
//I am ikun
```

**注意：** `启动子`  必须以 `-` 字符开始，参数数量可以是0

# API

偷懒挂描述文件算了

## TTerminal

```ts
interface TTerminal {
    //注册命令
    register(command: string, handler: (em: EventEmitter) => void, opt?: any): void;
    //注销指令
    unregister(command: string): void;
    //运行指令
    exec(commandString: string, onerror: (err: Error) => void): Promise<boolean>;
}
```

## TellrawConsole

```ts
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
```

## Tconsole

```ts
interface TConsole extends TTerminal{
    //获得console实例
    getConsole(): TellrawConsole;
    //将console注入到全局
    injectConsole(): void;
    //设置染色的格式
    setFormatting(type: 'minecraft'|'ansiEscapeSeq'): void
    //没什么用
    showDetail(bool: boolean): void;
    //调整缩进所占的空格数
    tabSize(count: number): void;
    //更新推送队列
    update(): void;
    //监听器，暂时没啥用
    on(type: string, handler: (...args: any[]) => void): TConsole;
    off(type: string, handler: (...args: any[]) => void): void;
}
```

## initConsole

```ts
initConsole(receiver: (msg: string) => void): TConsole;
```

# 样式

只提供两套样式，`minecraft`  和  `ansiEscapeSeq`

`minecraft` :  以 § 开头的各种样式代码, 用于我的世界游戏内

`ansiEscapeSeq` ：[ANSI Escape Sequences](https://www.tw.studiodahu.com/baike-ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97)，用于支持ANSI转义序列的控制台程序，如`Powershell`  和  `Windows Terminal`

使用：

```js
// ... 你的代码
const tConsole = initConsole(somePrintFunc);
tConsole.setFormatting('ansiEscapeSeq')
```

<div id="兼容-CommonJS"></div>

## 兼容 CommonJS

方法：将所有 `import {initConsole} from './console.js'`  替换为  `const {initConsole} = require('./full.console')`


