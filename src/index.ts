import { View, Rect } from './gui';
import { Screen } from './screen/screen';
import { Application } from './gui/application';

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

const v3 = new View(screen, new Rect(2, 2, 3, 2));
v3.background = 4;

const v3_1 = new View(screen, new Rect(1, 0, 2, 1));
v3_1.background = 6;

const v3_2 = new View(screen, new Rect(2, 0, 2, 3));
v3_2.background = 0;

const v2 = new View(screen, new Rect(2, 3, 5, 5));
v2.background = 3;
v2.addChild(v3);
v2.addChild(v3_1);
v2.addChild(v3_2);

const v1 = new View(screen, new Rect(2, 2, 10, 10));
v1.addChild(v2);

const application = new Application(screen, v1);
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
