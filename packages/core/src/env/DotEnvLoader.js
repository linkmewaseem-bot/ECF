import fs from "node:fs";
import EnvError from "../errors/EnvError.js";

const VALID_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export default class DotEnvLoader {
    load(filePath) {
        const content = this.readFile(filePath);
        return this.parse(content);
    }

    readFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new EnvError(`Env file not found at "${filePath}".`);
        }
        return fs.readFileSync(filePath, "utf-8");
    }

    parse(content) {
        const result = {};
        const lines = content.split(/\r?\n/);

        for (let rawLine of lines) {
            const line = rawLine.trim();

            if (line === "" || line.startsWith("#")) {
                continue;
            }

            const parsed = this.parseLine(line);
            if (parsed) {
                result[parsed.key] = parsed.value;
            }
        }

        return result;
    }

    parseLine(line) {
        const withoutExport = line.replace(/^export\s+/, "");

        const separatorIndex = withoutExport.indexOf("=");
        if (separatorIndex === -1) {
            return null;
        }

        const key = withoutExport.slice(0, separatorIndex).trim();
        let value = withoutExport.slice(separatorIndex + 1).trim();

        if (key === "") {
            return null;
        }

        this.validateKey(key);

        value = this.stripQuotes(value);
        value = this.stripInlineComment(value);

        return { key, value };
    }

    validateKey(key) {
        if (!VALID_KEY_PATTERN.test(key)) {
            throw new EnvError(`Invalid environment variable name "${key}".`);
        }
    }

    stripQuotes(value) {
        const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
        const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

        if (isDoubleQuoted || isSingleQuoted) {
            let unquoted = value.slice(1, -1);
            if (isDoubleQuoted) {
                unquoted = unquoted.replace(/\\n/g, "\n");
            }
            return unquoted;
        }

        return value;
    }

    stripInlineComment(value) {
        const commentIndex = value.indexOf(" #");
        if (commentIndex !== -1) {
            return value.slice(0, commentIndex).trim();
        }
        return value;
    }
}