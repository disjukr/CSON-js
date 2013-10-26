var assert = require('assert');
var util = require('util');

var CSON = require('./cson');

function type(a) {
    if (a === null) return 'null';
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
    message = typeof message === 'undefined' ?
        input : message.toUpperCase() + ':';
    console.log('\x1B[1m' + message + '\x1B[22m');
    var actual = CSON.parse(input);
    console.log('expected: ' + util.inspect(expected));
    console.log('actual: ' + util.inspect(actual));
    assert(compare(actual, expected), message);
    console.log('\x1B[1m\x1B[32mPASS\x1B[39m\x1B[22m');
}

function printSubject(subject) {
    console.log('\x1B[33m# ' + subject + '\x1B[39m');
}


printSubject('Primitive types');

parseTest('true', true, 'true');
parseTest('false', false, 'false');
parseTest('null', null, 'null');
parseTest('0', 0, 'zero');
parseTest('1', 1, 'one');
parseTest('10', 10, 'ten');
parseTest('-1', -1, 'minus one');
parseTest('-1.23e45', -1.23e45, 'ieee float');


printSubject('String');

parseTest('""', '', 'empty double quote string');
parseTest("''", '', 'empty single quote string');
parseTest('"\'"', "'", 'single quote in double quote string');
parseTest("'\"'", '"', 'double quote in single quote string');


printSubject('Array');

parseTest('[]', [], 'array');
parseTest('[0]', [0], 'one length array');
parseTest('[0, 1]', [0, 1], 'two length array');
parseTest('[true, null, 0, \'string\']',
          [true, null, 0, 'string'],
          'multitype');
parseTest('[0\n1\n2]', [0, 1, 2], 'newline instead of comma');
parseTest('[1, 2, 3, ]', [1, 2, 3], 'trailing comma');
parseTest('1, 2', [1, 2]);
parseTest('3, 4, ', [3, 4]);
parseTest('true\nfalse', [true, false]);


printSubject('Object');

parseTest('{}', {}, 'object');
parseTest('{"a": 0}', {a: 0});
parseTest('{\'b\': true}', {b: true});
parseTest('{c: null}', {c: null});
parseTest('d: "string"', {d: 'string'});
parseTest('e = []', {e: []});