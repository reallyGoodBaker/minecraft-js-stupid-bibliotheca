import {initConsole} from '../src/tellraw_console/index.js'

const commander = {runCommand(...args) {
    console.log(...args);
}}

const tConsole = initConsole(commander);
const con = tConsole.getConsole();

window.con = con;
window.exec = str => tConsole.exec(str);

setInterval(() => tConsole.update(), 50);

con.log({
    a: 1,
    b: [11, 255, 'wow'],
    c: {foo: 'bar', b: {}}
})