// import { Glyph } from './screen';
import { Screen } from './screen/screen';

const app = document.getElementById('app') as HTMLDivElement;
const canvas = document.createElement('canvas');
app.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// tslint:disable-next-line: no-unused-expression
new Screen(canvas);
