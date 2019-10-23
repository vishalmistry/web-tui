# Text User Interface (on the web!)

_Sometimes you just want to live in the past while working on technologies of the future._

This package provides a set of components to build text based UIs, like those of old, but run in the browser using a HTML Canvas element to render a "screen".

## Getting Started

To create a screen, simply create a new `Screen` instance and pass in a `<div>` element.

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

## TUI Framework

Once you have the screen up and running, you can write your code against primitives like `moveTo()` and `print()` but that is tedious. Alternatively, you can use the TUI framework for more complex applications - it provides common components such as checkboxes, text boxes, radio buttons and others. It also comes with a layout engine allowing you to layout the components in a natural fashion. Since the framework is interactive, you probably want to enable mouse and keyboard support on the screen ¯\\_(ツ)_/¯

```
const application = new Application(screen);
application.showModal(new Frame('Hello World'));
application.start();
```

## Demo

A demo of how to use the the TUI Framework is available at the [web-tui-demo](https://github.com/vishalmistry/web-tui-demo) repository.

## Credits

The layout engine is a reimplementation of the one written by Miguel de Icaza for his [gui.cs](https://github.com/migueldeicaza/gui.cs) project - it was used as a reference to produce the implementation here.

## To-do

Components:

   * Combo box
   * Multi-line text edit
   * List view
   * Scroll bars / Scroll views
   * Progress bar
   * Message boxes
   * Dialogs

Functionality:

   * Default buttons
   * Close menu when clicking outside
   * Tab into textbox should place cursor at the end

Known bugs:

   * Resizable screen causes artifacts
   * Cursor sometimes stays hidden even when in a text field
