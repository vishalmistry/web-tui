import { DosColors } from '../screen/dos-colors';
import { Theme } from './theme';

export class DosTheme implements Theme {
    public static instance = new DosTheme();

    default = {
        normal: { background: DosColors.blue, foreground: DosColors.brightWhite },
        hover: { background: DosColors.blue, foreground: DosColors.brightWhite },
        focused: { background: DosColors.blue, foreground: DosColors.brightWhite },
    };
    button = {
        normal: { background: DosColors.blue, foreground: DosColors.brightWhite },
        hover: { background: DosColors.cyan, foreground: DosColors.brightWhite },
        focused: { background: DosColors.cyan, foreground: DosColors.brightWhite },
    };
    checkBox = {
        normal: { background: DosColors.blue, foreground: DosColors.brightWhite },
        hover: { background: DosColors.cyan, foreground: DosColors.brightWhite },
        focused: { background: DosColors.cyan, foreground: DosColors.brightWhite },
    };

    private constructor() {
    }
}
