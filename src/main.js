import {world} from 'mojang-minecraft'
import {ActionFormData, MessageFormData, ModalFormData} from 'mojang-minecraft-ui'
// import MCConsole from './console.js'
import {initConsole} from './tellraw_console/index.js'
import {FuckYouMojangUI, button, dropdown, toggle} from './fymui.js'

let console = initConsole(world.getDimension('overworld'))

const ui = new FuckYouMojangUI({ActionFormData, MessageFormData, ModalFormData}).build();

world.events.blockBreak.subscribe(e => {

    console.warn('you break a block!');

    // ui.message(e.player, {
    //     title: 'test',
    //     body: "就是个测试",
    //     btns: [
    //         button('Accept', () => {
    //             console.log('按下了Accept');
    //         }),

    //         button('Deny', () => {
    //             console.error('按下了Deny');
    //         })
    //     ]
    // })

    // ui.action(e.player, {
    //     title: 'Action',
    //     body: '随便点一个?',
    //     btns: new Array(8).fill(0).reduce((pre, cur, i) => {
    //         return [...pre, button(`button ${i}`, () => console.log('按下了第', i, '个选项'))]
    //     }, []),
    // })

    ui.modal(e.player, {
        title: 'modal',
        children: [

            toggle('这是个toggle', false, data => {
                console.log(data);
            }),

            dropdown('dropdown', [
                '第一个', '第二个', '第三个'
            ], i => {
                console.log("选择了第 %d 个", i + 1);
            })
            
        ],
        onCanceled(e) {
            if (e) return console.error('Timeout');
            console.log('You clicked close');
        }
    })

})