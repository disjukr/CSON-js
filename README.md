CSON-js
=======
__CSON__(Cursive Script Object Notation)
is a superset of [JSON](http://json.org/)
that can be written by hand and translated to a canonical JSON.

[CSON](http://noe.mearie.org/cson/) is
designed by [Kang Seonghoon](https://github.com/lifthrasiir),
and CSON-js is written by [JongChan Choi](https://github.com/disjukr).

___Please check out the [demo](http://0xabcdef.com/CSON-js/)___

[![npm](https://badge.fury.io/js/cursive.png)](https://npmjs.org/package/cursive)
[![travis](https://travis-ci.org/disjukr/CSON-js.png)](https://travis-ci.org/disjukr/CSON-js)


Usage
-----

Install [cursive](https://npmjs.org/package/cursive) module for [node](http://nodejs.org/):
```sh
npm install cursive
```

Basic example:
```javascript
if (typeof module !== 'undefined')
    var CSON = require('cursive');

CSON.toJSON('"a": 1, b = 2');
// returns {"a":1,"b":2} as string

CSON.parse('c: |verbatim\n|string!\n "d" = ["newline"\n"to"\n"separate"]');
// returns {"c": "verbatim\nstring!", "d": ["newline", "to", "separate"]} as object
```

You can make formatted json output from cson:

```javascript
CSON.toJSON('e = {}, f = [1, 2, 3]', 4/* indent by four spaces */);
```

that returns

```json
{
    "e": {},
    "f": [
        1,
        2,
        3
    ]
}
```

`CSON.toJSON(text, indent)` returns minified json
if you putting `0`(or any kind of false value) to `indent` parameter.
This behavior is default.

If you want formatted json without indentation, use `'0'` instead of `0`:

```javascript
CSON.toJSON('e = {}, f = [1, 2, 3]', '0');
```

then

```json
{
"e": {},
"f": [
1,
2,
3
]
}
```


License
-------

The MIT License (MIT)

Copyright (c) 2013, JongChan Choi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.