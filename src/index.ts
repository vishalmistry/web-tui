import { Screen } from './screen';
import { DosColors } from './screen/dos-colors';
import {
    Application,
    Button,
    CheckBox,
    Dimension,
    DosTheme,
    Frame,
    Label,
    Position,
    RadioGroup,
    TextBox,
    Window,
} from './tui';

const app = document.getElementById('app') as HTMLDivElement;

// tslint:disable-next-line: no-unused-expression
const screen = new Screen(app);
screen.isResizable = true;
screen.isMouseEnabled = true;
screen.isKeyboardEnabled = true;
screen.captureTabKey = true;
screen.isCursorVisible = true;

const mainWindow = new Window('Demo');

const enabledCheckbox = new CheckBox('Enable all the things');
enabledCheckbox.isChecked = true;
enabledCheckbox.x = Position.center();
enabledCheckbox.y = 1;
mainWindow.addChild(enabledCheckbox);

const mainControls = new Frame('');
mainControls.x = 1;
mainControls.width = Dimension.fill().subtract(1);
mainControls.y = Position.bottomOf(enabledCheckbox).add(1);
mainControls.height = Dimension.fill().subtract(1);
mainWindow.addChild(mainControls);

const label = new Label('Do something with the stuff below');
label.x = 1;
label.y = 1;
mainControls.addChild(label);

const checkBox = new CheckBox('Check me!');
checkBox.x = Position.leftOf(label);
checkBox.y = Position.bottomOf(label).add(1);
mainControls.addChild(checkBox);

const radioGroup = new RadioGroup(['Item One', 'Item Two', 'Item Three']);
radioGroup.x = Position.leftOf(label).add(2);
radioGroup.y = Position.bottomOf(checkBox).add(3);

const radioFrame = new Frame('Pick an item');
radioFrame.x = Position.leftOf(label);
radioFrame.y = Position.bottomOf(checkBox).add(1);
radioFrame.width = Dimension.widthOf(radioGroup).add(4);
radioFrame.height = Dimension.heightOf(radioGroup).add(4);

mainControls.addChild(radioFrame);
mainControls.addChild(radioGroup);

const usernameLabel = new Label('Username: ');
usernameLabel.x = Position.leftOf(label);
usernameLabel.y = Position.bottomOf(radioFrame).add(1);
mainControls.addChild(usernameLabel);

const username = new TextBox('guest');
username.x = Position.rightOf(usernameLabel);
username.y = Position.topOf(usernameLabel);
username.width = '10%';
mainControls.addChild(username);

const passwordLabel = new Label('Password: ');
passwordLabel.x = Position.leftOf(label);
passwordLabel.y = Position.bottomOf(usernameLabel).add(1);
mainControls.addChild(passwordLabel);

const password = new TextBox('', true);
password.x = Position.rightOf(passwordLabel);
password.y = Position.topOf(passwordLabel);
password.width = '10%';
mainControls.addChild(password);

const button = new Button('Press me!');
button.x = 1;
button.y = Position.end().subtract(1);
mainControls.addChild(button);

const modalButton = new Button('Ka-boom');
modalButton.x = Position.rightOf(button).add(2);
modalButton.y = Position.topOf(button);
mainControls.addChild(modalButton);

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

username.textChanged.subscribe((event) => {
    label.text = `You changed the user name to '${event.newValue}'`;
});

password.textChanged.subscribe((event) => {
    label.text = `You changed the password to '${event.newValue}'`;
});

button.clicked.subscribe(() => {
    label.text = 'You pressed the button.';
});

modalButton.clicked.subscribe((event) => {
    const window = new Window('Error', 40, 10);
    window.theme = {
        ...DosTheme.instance,
        default: {
            ...DosTheme.instance.default,
            normal: { background: DosColors.red, foreground: DosColors.brightWhite },
        },
        button: {
            normal: { background: DosColors.red, foreground: DosColors.brightYellow },
            hover: { background: DosColors.brightYellow, foreground: DosColors.red },
            focused: { background: DosColors.brightYellow, foreground: DosColors.red },
            disabled: { background: DosColors.red, foreground: DosColors.grey },
        },
    };

    const message = new Label('Something blew up!');
    message.x = Position.center();
    message.y = 1;
    window.addChild(message);

    const changeThemeBtn = new Button('Stop Panicking');
    changeThemeBtn.x = Position.center().subtract(6);
    changeThemeBtn.y = Position.end().subtract(1);
    window.addChild(changeThemeBtn);

    const closeBtn = new Button('Close');
    closeBtn.x = Position.rightOf(changeThemeBtn).add(2);
    closeBtn.y = Position.end().subtract(1);
    window.addChild(closeBtn);

    changeThemeBtn.clicked.subscribe(() => {
        window.theme = DosTheme.instance;
        closeBtn.x = Position.center();
        closeBtn.hasFocus = true;

        window.removeChild(changeThemeBtn);
    });
    closeBtn.clicked.subscribe((ce) => ce.source.application.dismissModal());

    event.source.application.showModal(window);
});

const application = new Application(screen);
application.showModal(mainWindow);
application.start();
