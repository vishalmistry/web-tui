import { Rect } from './common';
import { Application } from './gui/application';
import { Dimension, Position } from './gui/layout';
import { Button, CheckBox, Frame } from './gui/views';
import { Border } from './gui/views/border';
import { Screen } from './screen/screen';

const app = document.getElementById('app') as HTMLDivElement;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(app);
screen.isResizable = true;
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;
screen.captureTabKey = true;
screen.isCursorVisible = true;

const application = new Application(screen);
const mainView = application.mainView;

const border2 = new Border(new Rect(72, 7, 10, 10));
border2.background = 1;
mainView.addChild(border2);

const border1 = new Border(undefined, mainView);
border1.x = Position.percent(30);
border1.y = Position.center();
border1.height = Dimension.sized(10);
border1.width = Dimension.percent(30);
border1.background = 7;
mainView.addChild(border1);

const groupBox = new Frame('abcde');
groupBox.x = Position.at(1);
groupBox.y = Position.end();
groupBox.width = Dimension.sized(6);
groupBox.height = Dimension.sized(6);
groupBox.headerPosition = 'right';
border1.addChild(groupBox);

const innerBorder2 = new Border();
innerBorder2.x = Position.rightOf(groupBox).add(2);
innerBorder2.y = Position.at(2);
innerBorder2.width = Dimension.widthOf(groupBox);
innerBorder2.height = Dimension.heightOf(groupBox);
innerBorder2.background = 3;
border1.addChild(innerBorder2);

const separateBorder = new Border();
separateBorder.x = Position.rightOf(border1);
separateBorder.y = Position.bottomOf(border1);
separateBorder.width = Dimension.sized(4);
separateBorder.height = Dimension.sized(2);
separateBorder.background = 3;
separateBorder.hasFocus = true;
mainView.addChild(separateBorder);

let i = 0;
const button = new Button('Button');
button.x = Position.center();
button.y = Position.percent(30);
button.clicked.subscribe(() => {
    button.text = `Clicked ${++i}`;
    screen.moveTo(1, 23);
    screen.print(button.text);

    if (i === 1) {
    border1.height = Dimension.from('50%');

    groupBox.x = Position.percent(10);
    groupBox.y = Position.center();
    groupBox.width = Dimension.fill(40);
    groupBox.height = Dimension.percent(80);
    } else if (i === 5) {
        border1.y = Position.end();
        groupBox.headerPosition = 'right';
    } else if (i === 6) {
        groupBox.headerPosition = 'center';
        groupBox.frameStyle = 'double';
    } else {
        border1.x = border1.x === undefined ? Position.at(0) : border1.x.add(1);
    }
});
groupBox.addChild(button);

const checkBox = new CheckBox('Check Me');
checkBox.x = Position.center();
checkBox.y = Position.bottomOf(button).add(1);
checkBox.checkChanged.subscribe((args) => {
    const cb = args.source as CheckBox;
    cb.text = cb.isChecked ? 'Uncheck Me' : 'Check Me';
});
groupBox.addChild(checkBox);

application.start();

// screen.print('DMKC');

// screen.mouseMove.subscribe((ev) => {
//     if (ev.buttons === 1) {
//         screen.moveTo(ev.position);
//     }
//     if (ev.buttons === 2) {
//         screen.moveTo(ev.position);
//         screen.setCharacter(219);
//     }
// });
// screen.mouseDown.subscribe((ev) => {
//     if (ev.position.x === 0 && ev.position.y === 0) {
//         screen.destroy();
//         return;
//     }
//     if (ev.position.x === 1 && ev.position.y === 0) {
//         screen.isMouseEnabled = false;
//         return;
//     }
//     if (ev.position.x === 2 && ev.position.y === 0) {
//         screen.isKeyboardEnabled = !screen.isKeyboardEnabled;
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
// screen.keyPress.subscribe((ev) => {
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
