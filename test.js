var assert = require('assert');
var util = require('util');

var CSON = require('./cson');

function type(a) {
    if (util.isArray(a)) return 'array';
    if (util.isDate(a)) return 'date';
    if (util.isError(a)) return 'error';
    if (util.isRegExp(a)) return 'regexp';
    return typeof a;
}

function compareType(a, b) {
    return type(a) === type(b);
}

function compareArray(a, b) {
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i)
        if (!compare(a[i], b[i]))
            return false;
    return true;
}

function compareNumber(a, b) {
    if (isNaN(a) && isNaN(b))
        return true;
    return a === b;
}

function compareObject(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length)
        return false;
    for (key in a)
        if (!compare(a[key], b[key]))
            return false;
    return true;
}

function compareOther(a, b) {
    return String(a) === String(b);
}

function compare(a, b) {
    if (!compareType(a, b))
        return false;
    if (isNaN(a) && isNaN(b))
        return true;
    switch (type(a)) {
    case 'array':
        return compareArray(a, b);
    case 'date':
        return compareOther(a, b);
    case 'error':
        return compareOther(a, b);
    case 'number':
        return compareNumber(a, b);
    case 'object':
        return compareObject(a, b);
    case 'regexp':
        return compareOther(a, b);
    default:
        return a === b;
    }
}

function parseTest(input, expected, message) {
    util.print(message + '...');
    assert(compare(CSON.parse(input), expected), message);
    util.print('ok\n');
}

console.log('Primitive types');
parseTest('{}', {}, 'object');
parseTest('[]', [], 'array');
parseTest('true', true, 'true');
parseTest('false', false, 'false');
parseTest('0', 0, 'zero');
parseTest('1', 1, 'one');
parseTest('10', 10, 'ten');