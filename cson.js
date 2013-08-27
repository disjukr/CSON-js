if (typeof CSON !== 'object')
    var CSON = {};
(function () {
    CSON.toJSON = toJSON;
    function isName(char) {
        return !/\s|,|:|=|"|'|\[|\{|\]|\}|#/.test(char);
    }
    function isWS(char) {
        return /\s/.test(char);
    }
    function isCRLF(char, nextChar) {
        return char === '\r' && nextChar === '\n';
    }
    function isNameSeparator(char) {
        return char === ':' || char === '=';
    }
    function isEndOfString(prevChar, char) {
        return prevChar !== '\\' && (char === '\"' || char === '\'');
    }
    function stringToLiteral(string) {
        string = string.replace(/\\/g, '\\\\');
        string = string.replace(/[\b]/g, '\\b');
        string = string.replace(/\f/g, '\\f');
        string = string.replace(/\n/g, '\\n');
        string = string.replace(/\r/g, '\\r');
        string = string.replace(/\t/g, '\\t');
        string = string.replace(/\v/g, '\\v');
        string = string.replace(/\"/g, '\\\"');
        return string;
    }
    function tokenize(text) {
        var tokens = [];
        var prevChar, currentChar, nextChar;
        var buffer;
        var verbatimBuffer;
        var verbatimExit;
        for (var i = 0; i < text.length; ++i) {
            currentChar = text.charAt(i);
            prevChar = text.charAt(i - 1);
            nextChar = text.charAt(i + 1);
            if (currentChar === '[') tokens.push('[');
            else if (currentChar === '{') tokens.push('{');
            else if (currentChar === ']') tokens.push(']');
            else if (currentChar === '}') tokens.push('}');
            else if (currentChar === ',' || currentChar === '\n') continue;
            else if (isCRLF(currentChar, nextChar)) ++i;
            else if (isNameSeparator(currentChar)) tokens.push(':');
            else if (currentChar === '\"' || currentChar === '\'') {
                buffer = '';
                currentChar = text.charAt(++i);
                prevChar = text.charAt(i - 1);
                while (!isEndOfString(prevChar, currentChar) &&
                       i < text.length) {
                    buffer += currentChar;
                    currentChar = text.charAt(++i);
                    prevChar = text.charAt(i - 1);
                }
                tokens.push('\"' + buffer + '\"');
            }
            else if (currentChar === '|') {
                buffer = '';
                verbatimBuffer = [];
                verbatimExit = false;
                while(i < text.length) {
                    currentChar = text.charAt(++i);
                    nextChar = text.charAt(i + 1);
                    if (verbatimExit) {
                        if (currentChar === '|') {
                            verbatimExit = false;
                            continue;
                        }
                        else if (isCRLF(currentChar, nextChar)) {
                            ++i;
                            break;
                        }
                        else if (currentChar === '\n') break;
                        else if (!isWS(currentChar)) {
                            --i;
                            break;
                        }
                    }
                    else if (isCRLF(currentChar, nextChar)) {
                        ++i;
                        verbatimBuffer.push(stringToLiteral(buffer));
                        buffer = '';
                        verbatimExit = true;
                    }
                    else if (currentChar === '\n') {
                        verbatimBuffer.push(stringToLiteral(buffer));
                        buffer = '';
                        verbatimExit = true;
                    }
                    else buffer += currentChar;
                }
                if (!verbatimExit)
                    verbatimBuffer.push(stringToLiteral(buffer));
                buffer = '';
                tokens.push('\"' + verbatimBuffer.join('\\n') + '\"');
            }
            else if (currentChar === '#') {
                while (i < text.length) {
                    currentChar = text.charAt(++i);
                    nextChar = text.charAt(i + 1);
                    if (currentChar === '\n') break;
                    else if (isCRLF(currentChar, nextChar)) {
                        ++i;
                        break;
                    }
                }
            }
            else if (isWS(currentChar)) {
                while (isWS(currentChar) && i < text.length)
                    currentChar = text.charAt(++i);
                --i;
            }
            else {
                if (!isName(nextChar)) {
                    tokens.push(currentChar);
                    continue;
                }
                buffer = currentChar;
                while (i < text.length) {
                    currentChar = text.charAt(++i);
                    nextChar = text.charAt(i + 1);
                    buffer += currentChar;
                    if (!isName(nextChar)) break;
                }
                tokens.push(buffer);
            }
        }
        return tokens;
    }
    function toJSON(text, indent) {
        var tokens = tokenize(String(text));
        var indentLevel = 0;
        function newline() {
            var indentCount = Math.max(indent * indentLevel + 1, 0);
            return '\n' + Array(indentCount).join(' ');
        }
        if (!/\[|\{/.test(tokens[0])) {
            tokens.unshift('{');
            tokens.push('}');
        }
        for (var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
            var nextToken = tokens[i + 1];
            if (indent) {
                if (token === ':') tokens[i] += ' ';
                if (/\[|\{/.test(token.charAt())) ++indentLevel;
                if (/\]|\}/.test(token.charAt())) --indentLevel;
            }
            if (isName(token.charAt()) && tokens[i + 1] === ':')
                tokens[i] = '\"' + tokens[i] + '\"';
            if (!/\[|\{|:/.test(tokens[i].charAt()) &&
                typeof nextToken !== 'undefined' &&
                !/\]|\}|:/.test(nextToken.charAt())) {
                tokens[i] += ',';
                if (indent) tokens[i] += newline();
            }
        }
        if (indent) {
            for (i = 0; i < tokens.length; ++i) {
                var token = tokens[i];
                if (/\[|\{/.test(token.charAt())) {
                    ++indentLevel;
                    tokens[i] += newline();
                }
                if (/\]|\}/.test(token.charAt())) {
                    --indentLevel;
                    tokens[i] = newline() + token;
                }
            }
        }
        return tokens.join('');
    }
})();