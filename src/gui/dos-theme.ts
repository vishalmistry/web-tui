import { DosColors } from './dos-colors';
import { Theme } from './theme';

export class DosTheme implements Theme {
    default = {
        normal: { background: DosColors.grey, foreground: DosColors.brightWhite },
        hover: { background: DosColors.grey, foreground: DosColors.brightWhite },
        focused: { background: DosColors.grey, foreground: DosColors.brightWhite },
    };
    button = {
        normal: { background: DosColors.blue, foreground: DosColors.brightWhite },
        hover: { background: DosColors.cyan, foreground: DosColors.brightWhite },
        focused: { background: DosColors.grey, foreground: DosColors.brightWhite },
    };
}
