if (typeof CSON !== 'object')
    var CSON = {};
if (typeof module !== 'undefined')
    module.exports = CSON;
(function () {
    CSON.toJSON = toJSON;
    CSON.parse = parse;
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
    function isEndOfDQuote(prevChar, char) {
        return prevChar !== '\\' && char === '\"';
    }
    function isEndOfSQuote(prevChar, char) {
        return prevChar !== '\\' && char === '\'';
    }
    function isBeginOfBracket(char) {
        return char === '[' || char === '{';
    }
    function isEndOfBracket(char) {
        return char === ']' || char === '}';
    }
    function stringToLiteral(string) {
        string = string.replace('\\', '\\\\');
        string = string.replace('\b', '\\b');
        string = string.replace('\f', '\\f');
        string = string.replace('\n', '\\n');
        string = string.replace('\r', '\\r');
        string = string.replace('\t', '\\t');
        string = string.replace('\"', '\\\"');
        return string;
    }
    function tokenize(text) {
        var tokens = [];
        var prevChar, currentChar, nextChar;
        var buffer;
        var isSQuote;
        var escapeCount;
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
                isSQuote = currentChar === '\'';
                escapeCount = 0;
                currentChar = text.charAt(++i);
                prevChar = text.charAt(i - 1);
                while (!(isSQuote?
                         isEndOfSQuote(prevChar, currentChar) :
                         isEndOfDQuote(prevChar, currentChar)) &&
                       i < text.length) {
                    if (isSQuote &&
                        currentChar === '\"' &&
                        (escapeCount % 2) === 0)
                        buffer += '\\';
                    buffer += currentChar;
                    escapeCount = (currentChar === '\\')? escapeCount + 1 : 0;
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
        if (!isBeginOfBracket(tokens[0])) {
            if (tokens[1] !== undefined) {
                if (tokens[1] === ':') {
                    tokens.unshift('{');
                    tokens.push('}');
                }
                else {
                    tokens.unshift('[');
                    tokens.push(']');
                }
            }
        }
        for (var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];
            var nextToken = tokens[i + 1];
            if (indent) {
                if (token === ':') tokens[i] += ' ';
                if (isBeginOfBracket(token.charAt())) ++indentLevel;
                if (isEndOfBracket(token.charAt())) --indentLevel;
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
                var prevToken = tokens[i - 1];
                var nextToken = tokens[i + 1];
                if (isBeginOfBracket(token.charAt())) {
                    ++indentLevel;
                    if (nextToken && !isEndOfBracket(nextToken.charAt()))
                        tokens[i] += newline();
                }
                if (isEndOfBracket(token.charAt())) {
                    --indentLevel;
                    if (prevToken && !isBeginOfBracket(prevToken.charAt()))
                        tokens[i] = newline() + token;
                }
            }
        }
        return tokens.join('');
    }
    function parse(csonString) {
        return JSON.parse(toJSON(csonString));
    }
})();
