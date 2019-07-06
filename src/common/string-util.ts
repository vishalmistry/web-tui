function repeatStr(s: string, count: number) {
    let result = '';
    for (let i = 0; i < count; i++) {
        result = result + s;
    }
    return result;
}

export function leftAlignString(text: string, width: number, padChar = ' '): string {
    if (width > text.length) {
        return text + repeatStr(padChar, width - text.length);
    } else {
        return text.substr(0, width);
    }
}

export function rightAlignString(text: string, width: number, padChar = ' '): string {
    if (width > text.length) {
        return repeatStr(padChar, width - text.length) + text;
    } else {
        return text.substr(Math.max(0, text.length - width));
    }
}

export function centerString(text: string, width: number, padChar = ' '): string {
    if (width > text.length) {
        const padLeft = Math.floor((width - text.length) / 2);
        const padRight = width - padLeft - text.length;
        return repeatStr(padChar, padLeft) + text + repeatStr(padChar, padRight);
    } else {
        const start = Math.floor((text.length - width) / 2);
        return text.substr(start, width);
    }
}

export function justifyString(text: string, width: number, padChar = ' '): string {
    if (width > text.length) {
        const words = text.split(' ').filter((w) => w.length > 0);
        const charCount = words.map((w) => w.length).reduce((p, c) => p + c);
        const remainingSpace = width - charCount;
        const gaps = words.length - 1;
        const wordPad = Math.floor(remainingSpace / gaps);
        const midWord = Math.round(words.length / 2) - 1;
        const midWordPad = wordPad + (remainingSpace - (wordPad * gaps));

        let result = '';
        for (let i = 0; i < words.length; i++) {
            let padding = wordPad;
            if (i === midWord) {
                padding = midWordPad;
            } else if (i === words.length - 1) {
                padding = 0;
            }

            result = result + words[i] + repeatStr(padChar, padding);
        }

        return result;
    } else {
        return leftAlignString(text, width, padChar);
    }
}
