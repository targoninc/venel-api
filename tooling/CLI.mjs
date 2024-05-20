export class CLI {
    static withColor(text, color, newLine = true) {
        const timestamp = new Date().toISOString();
        text = `[${timestamp}] ${text}`;
        process.stdout.write(`\x1b[${color}m${text}\x1b[0m${newLine ? "\n" : ""}`);
    }

    static error(text, newLine = true) {
        CLI.withColor(text, 31, newLine);
    }

    static warning(text, newLine = true) {
        CLI.withColor(text, 33, newLine);
    }

    static info(text, newLine = true) {
        CLI.withColor(text, 36, newLine);
    }

    static success(text, newLine = true) {
        CLI.withColor(text, 32, newLine);
    }

    static debug(text, newLine = true) {
        CLI.withColor(text, 35, newLine);
    }

    static log(text, newLine = true) {
        CLI.info(text, newLine);
    }

    static write(text, newLine = true) {
        process.stdout.write(text + (newLine ? "\n" : ""));
    }

    static sameLineDiff(tokens, compareTokens) {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === compareTokens[i]) {
                CLI.error(compareTokens[i] + " ", false);
            } else {
                CLI.success(tokens[i] + " ", false);
            }
        }
    }

    static rewrite(text) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(text);
    }

    static trace(toLog) {
        CLI.object(toLog);
        const stack = new Error().stack
            .split("\n")
            .slice(2)
            .join("\n");
        CLI.debug(stack);
    }

    static object(obj) {
        CLI.debug(JSON.stringify(obj, null, 4));
    }
}