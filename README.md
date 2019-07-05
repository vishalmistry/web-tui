# Text User Interface (on the web!)

_Sometimes you just want to live in the past while working on technologies of the future._

This package provides a set of components to build text based UIs, like those of old, but run in the browser using a HTML Canvas element to render a "screen".

## Getting Started

To create a screen, simply create a new Screen instance and pass in a `<div>` element.

```
const app = document.getElementById('app') as HTMLDivElement;
const screen = new Screen(app);
```

A screen has support for keyboard and mouse events and even a blinking cursor, but you will have to enable the features you want.

```
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;
screen.isCursorVisible = true;
```

## TUI Toolkit

Once you have the screen up and running, you can hack away by using the screen primitives like `moveTo()` and `print()`, or you can use the TUI framework for more complex applications. Since the framework is interactive, you probably want to enable mouse and keyboard support on the screen.

```
const application = new Application(screen);
application.mainView.addChild(new Frame('Hello World'));
application.start();
```