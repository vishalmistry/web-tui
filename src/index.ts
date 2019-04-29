import { Screen } from './screen/screen';

const app = document.getElementById('app') as HTMLDivElement;
const canvas = document.createElement('canvas');
app.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(canvas);
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;

screen.addEventHandler('mousemove', (ev) => {
    if (ev.buttons === 1) {
        screen.moveTo(ev.position);
        screen.setCharacter(219);
    }
});
screen.addEventHandler('mousedown', (ev) => {
    if (ev.buttons === 1) {
        screen.moveTo(ev.position);
        screen.print('HELLO');
    }

    if (ev.position.x === 0 && ev.position.y === 0) {
        screen.destroy();
    }
    if (ev.position.x === 1 && ev.position.y === 0) {
        screen.isMouseEnabled = false;
    }
    if (ev.position.x === 2 && ev.position.y === 0) {
        screen.isKeyboardEnabled = false;
    }
});
screen.addEventHandler('keypress', (ev) => {
    screen.print(ev.key);
});

console.log(`Screen size: ${screen.columns}x${screen.rows}`);
const message = ' HELLO WORLD ';
screen.foreground = 15;
screen.background = 1;
screen.moveTo(Math.floor(screen.columns / 2) - Math.floor(message.length / 2), Math.floor(screen.rows / 2));
screen.print(message);

screen.moveTo(screen.columns - 5, screen.rows - 1);
screen.print('HELLO WORLD');
