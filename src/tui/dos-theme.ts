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
