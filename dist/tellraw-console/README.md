# Tellraw-console for minecraft

## 快速上手

### 1. 注入 `console`

```js
//main.js

import {initConsole} from './tellraw-console'
import {world} from 'mojang-minecraft'

const tConsole = initConsole(world.getDimension('overworld'));
tConsole.injectConsole(); //将 console 注入全局环境

world.events.tick.subscribe(() => tConsole.update()); //每 tick 更新一次 console 的状态。由于 console 的推送基于消息队列，此函数是消息队列的执行函数, 所以不执行这个函数就不会看到任何东西
```

### 2. 使用  `TConsole.exec`

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

