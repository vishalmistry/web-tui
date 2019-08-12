import { DosColors } from '../screen/dos-colors';
import { Theme } from './theme';

export class DosTheme implements Theme {
    public static instance = new DosTheme();

    default = {
        normal: { background: DosColors.blue, foreground: DosColors.brightWhite },
        hover: { background: DosColors.darkGrey, foreground: DosColors.brightYellow },
        focused: { background: DosColors.cyan, foreground: DosColors.brightWhite },
        disabled: { background: DosColors.blue, foreground: DosColors.grey },
    };

    menuBar = {
        normal: { background: DosColors.grey, foreground: DosColors.black },
        hotKey: { background: DosColors.grey, foreground: DosColors.red },
        focused: { background: DosColors.blue, foreground: DosColors.brightWhite },
        focusedHotKey: { background: DosColors.blue, foreground: DosColors.brightRed },
        disabled: { background: DosColors.grey, foreground: DosColors.grey },
    };

    menu = {
        frame: { ...this.menuBar.normal },
        normal: { ...this.menuBar.normal },
        hotKey: { ...this.menuBar.hotKey },
        focused: { ...this.menuBar.focused },
        focusedHotKey: { ...this.menuBar.focusedHotKey },
        disabled: { ...this.menuBar.disabled },
    };

    button = {
        normal: { ...this.default.normal },
        hover: { ...this.default.hover },
        focused: { ...this.default.focused },
        disabled: { ...this.default.disabled },
    };

    checkBox = {
        normal: { ...this.default.normal },
        hover: { ...this.default.hover },
        focused: { ...this.default.focused },
        disabled: { ...this.default.disabled },
    };

    radioGroup = {
        normal: { ...this.default.normal },
        hover: { ...this.default.hover },
        focused: { ...this.default.focused },
        disabled: { ...this.default.disabled },
    };

    textBox = {
        normal: { ...this.default.normal },
        hover: { ...this.default.hover },
        focused: { ...this.default.focused },
        disabled: { ...this.default.disabled },
    };

    private constructor() {
    }
}
