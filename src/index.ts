import { View, Rect } from './gui';
import { Screen } from './screen/screen';
import { Application } from './gui/application';
import { Border } from './gui/views/border';

const app = document.getElementById('app') as HTMLDivElement;
const canvas = document.createElement('canvas');
app.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(canvas);
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;
screen.isCursorVisible = true;

const mainView = new View(new Rect(0, 0, screen.columns, screen.rows));

const border1 = new Border(new Rect(2, 2, 10, 10));
border1.background = 7;
mainView.addChild(border1);

const border2 = new Border(new Rect(7, 7, 10, 10));
border2.background = 1;
mainView.addChild(border2);

const innerBorder = new Border(new Rect(2, 2, 6, 6));
innerBorder.background = 4;
border2.addChild(innerBorder);

const separateBorder = new Border(new Rect(13, 2, 2, 2));
separateBorder.background = 3;
mainView.addChild(separateBorder);

const application = new Application(screen, mainView);
application.start();

// screen.print('DMKC');

// screen.addEventHandler('mousemove', (ev) => {
//     if (ev.buttons === 1) {
//         screen.moveTo(ev.position);
//     }
//     if (ev.buttons === 2) {
//         screen.moveTo(ev.position);
//         screen.setCharacter(219);
//     }
// });
// screen.addEventHandler('mousedown', (ev) => {
//     if (ev.position.x === 0 && ev.position.y === 0) {
//         screen.destroy();
//         return;
//     }
//     if (ev.position.x === 1 && ev.position.y === 0) {
//         screen.isMouseEnabled = false;
//         return;
//     }
//     if (ev.position.x === 2 && ev.position.y === 0) {
//         screen.isKeyboardEnabled = false;
//         return;
//     }
//     if (ev.position.x === 3 && ev.position.y === 0) {
//         screen.isCursorVisible = !screen.isCursorVisible;
//         return;
//     }

//     if (ev.buttons === 1) {
//         screen.moveTo(ev.position);
//     }

//     if (ev.buttons === 2) {
//         screen.moveTo(ev.position);
//         screen.setCharacter(219);
//     }

// });
// screen.addEventHandler('keypress', (ev) => {
//     screen.print(ev.key);
// });

// console.log(`Screen size: ${screen.columns}x${screen.rows}`);
// const message = ' HELLO WORLD ';
// screen.foreground = 15;
// screen.background = 1;
// screen.moveTo(Math.floor(screen.columns / 2) - Math.floor(message.length / 2), Math.floor(screen.rows / 2));
// screen.print(message);

// screen.moveTo(screen.columns - 5, screen.rows - 1);
// screen.print('HELLO WORLD');
