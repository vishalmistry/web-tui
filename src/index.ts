import { Screen } from './screen/screen';

const app = document.getElementById('app') as HTMLDivElement;
const canvas = document.createElement('canvas');
app.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(canvas);
screen.isMouseEnabled = true;

screen.addEventHandler('mousemove', (ev) => {
    if (ev.buttons === 1) {
        screen.setCharacter(ev.position, 219);
    }
});
screen.addEventHandler('mousedown', (ev) => {
    if (ev.buttons === 1) {
        screen.print(ev.position, 'HELLO');
    }

    if (ev.position.x === 0 && ev.position.y === 0) {
        screen.destroy();
    }
    if (ev.position.x === 1 && ev.position.y === 0) {
        screen.isMouseEnabled = false;
    }
});

console.log(`Screen size: ${screen.columns}x${screen.rows}`);
const message = ' HELLO WORLD ';
screen.foreground = 15;
screen.background = 1;
screen.print(
    Math.floor(screen.columns / 2) - Math.floor(message.length / 2),
    Math.floor(screen.rows / 2),
    message);
