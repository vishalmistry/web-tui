import { Screen } from './screen';
import {
    Application,
    CheckBox,
    Dimension,
    Frame,
    Label,
    Position,
    RadioGroup,
} from './tui';

const app = document.getElementById('app') as HTMLDivElement;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(app);
screen.isResizable = true;
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;
screen.captureTabKey = true;
screen.isCursorVisible = true;

const application = new Application(screen);

const rootFrame = new Frame('Demo');
rootFrame.headerPosition = 'center';
rootFrame.frameStyle = 'double';
rootFrame.fill = true;

const enabledCheckbox = new CheckBox('Enable all the things');
enabledCheckbox.isChecked = true;
enabledCheckbox.x = Position.center();
enabledCheckbox.y = 1;
rootFrame.addChild(enabledCheckbox);

const mainControls = new Frame('');
mainControls.x = 1;
mainControls.width = Dimension.fill().subtract(1);
mainControls.y = Position.bottomOf(enabledCheckbox).add(1);
mainControls.height = Dimension.fill().subtract(1);
rootFrame.addChild(mainControls);

const label = new Label('Do something with the stuff below');
label.x = 1;
label.y = 1;
mainControls.addChild(label);

const checkBox = new CheckBox('Check me!');
checkBox.x = Position.leftOf(label);
checkBox.y = Position.bottomOf(label).add(1);
mainControls.addChild(checkBox);

const radioGroup = new RadioGroup(['Item One', 'Item Two', 'Item Three']);
radioGroup.x = Position.leftOf(label);
radioGroup.y = Position.bottomOf(checkBox).add(1);
mainControls.addChild(radioGroup);

enabledCheckbox.checkChanged.subscribe((event) => {
    mainControls.isEnabled = event.newValue;
});

checkBox.checkChanged.subscribe((event) => {
    label.text = `You ${event.newValue ? 'checked' : 'unchecked'} the checkbox.`;
    if (event.newValue) {
        radioGroup.items = ['Item 1', 'Item 2', 'Item 3'];
    } else {
        radioGroup.items = ['Item One', 'Item Two', 'Item Three'];
    }
});

radioGroup.selectionChanged.subscribe((event) => {
    label.text = `You selected '${radioGroup.items[event.newValue]}'.`;
});

application.mainView.addChild(rootFrame);
application.start();
