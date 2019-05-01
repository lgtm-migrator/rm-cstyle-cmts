[![Build Status](https://travis-ci.org/jeffy-g/rm-cstyle-cmts.svg?branch=master)](https://travis-ci.org/jeffy-g/rm-cstyle-cmts)
[![codecov](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts/branch/master/graph/badge.svg)](https://codecov.io/gh/jeffy-g/rm-cstyle-cmts)
[![npm version](https://badge.fury.io/js/rm-cstyle-cmts.svg)](https://badge.fury.io/js/rm-cstyle-cmts)
[![LICENSE](https://img.shields.io/badge/Lisence-Apache%202-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjeffy-g%2Frm-cstyle-cmts?ref=badge_shield)
[![DeepScan grade](https://deepscan.io/api/teams/3135/projects/4618/branches/37135/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3135&pid=4618&bid=37135)
<!-- https://img.shields.io/npm/v/rm-cstyle-cmts.svg -->
# remove cstyle comments

remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

> ### module definition
```ts
/**
 * "remove c style comments" function signature.
 */
interface IRemoveCStyleCommentsTypeSig {
    /**
     * #### remove c style comments form "source" content.  
     * 
     * step 1:  
     *  - remove line comments, multi line comments.  
     *  - and search the regexp literal. if found then concat it to results.  
     * 
     * step 2:  
     *  - remove whitespaces.(if need, see @param rm_blank_line_n_ws
     * 
     * @param {string} source c style commented text source.
     * @param {boolean} [rm_blank_line_n_ws] remove black line and whitespaces, default is `true`.
     * @param {boolean} [report_regex_evaluate_error] want report regex literal evaluation error? default is `undefined`
     */
    (
        source: string,
        rm_blank_line_n_ws?: boolean,
        report_regex_evaluate_error?: boolean
    ): string;
}
/**
 * "remove c style comments" module.
 */
interface IRemoveCStyleCommentsModule extends IRemoveCStyleCommentsTypeSig {
    /** package version */
    readonly version: string;
}

module.exports = Object.defineProperties(...) as IRemoveCStyleCommentsModule;
```

## install

> npm install rm-cstyle-cmts@latest --save-dev  
> \# shorthand  
> npm i rm-cstyle-cmts@latest -D

etc...

## BUGS

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts
* [X] ~~*`BUG:` When a newline character is CRLF, regexp instance specifying multiline flag can not correctly supplement CRLF with ^ and $*~~
* [X] ~~*`BUG:` In some cases, a newline character remains at the beginning or the end of the file. (`rm_blank_line_n_ws=true`, at src/ts/index.ts*~~
* [X] ~~*`BUG:` #cannot remove last new line char. (at src/ts/index.ts*~~
* [X] ~~*`FIXED:`? #cannot beyond regex. (at src/ts/index.ts*~~


## usage

```js
var rmc = require("rm-cstyle-cmts");
var fs = require("fs");

var name = "samples/es6";
var extension = "js";
var source = fs.readFileSync(`./${name}.${extension}`, 'utf-8');

console.info(" ----------- before contents ----------");
console.log(source);

// remove blank line and whitespaces.
var after = rmc(source/*, true*/);
console.info(" ----------- after contents -----------");
console.log(after);

fs.writeFile(`./${name}-after.${extension}`, after, 'utf-8', function() {
    console.log("data written...");
});

```

## then

#### before
> samples/es6.js
```javascript
  
var i = {} / 10; // -> NaN

{ i = "aaa\"" } /aaa/.test(i);
var i = 10000 / 111.77; /[/*]/.test(i); // */

/* comments */var i = 10000 / 111.77; /\][/*]/.test(i); // */

[/\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/];


let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;  ////// comments...
//             ^-------------^ <- this case is match. but, not regexp literal
//                 skip to -->^
//            line comment start -->^ <- parse by class SlashVisitor

// in this case, correctly detects.
const re4 = /\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/ /* comments...*/

let ok2 = 12.2 / 33 * .9 // "comments"...*/
//             ^ <- parse by class SlashVisitor
//                        ^---------------^ <- will recognize as regexp literal ...
//                       ^ however, since its actually a line comment, deleted from this position to the end of the line.

let ok3 = 12.2 / 33 * .9/* comments...*/
//             ^ <- parse by class SlashVisitor, in this case it can be correctly judged that it is not regexp literal.
//                      ^ <- parse by class SlashVisitor, Its recognized and deleted as multiline comment.

// ↓ parse by class SlashVisitor
/**
 * triple nested es6 template string.
 */
const test_text = `:Key Binding:${ 234 }}
//                ^  <- parse by class BackQuoteVistor
}
about                   [alt+A]
    ${
    "nest-1:" + `:Key Binding:${ 234 }}
    }

        ${

            // comment line...
            "nest-2:" + `:Key Binding:${ `let abc = ${
                Boolean("")
            }` }}
            }

                // comment line in backquote
                ${

                    /**
                    * triple nested es6 template string.
                    */

                    "nest-3:" + `:Key Binding:${ 234 }}
                    }

                    // comment line in backquote
                    :On comment:\`\  \"\`\"\\

                    ------------------------------[ X ]`
                }
            :On comment:\`\  \"\`\"\\

            ------------------------------[ X ]`
        }
    :On comment:\`\  \"\`\"\\

    ------------------------------[ X ]`

    // comment line...
    }
:On comment:\`\  \"\`\"\\

------------------------------[ X ]`;
  
     
     ;
/**
* block comment.
*/// test
const $3 = { keyCode: $1, key: "$5\"this is\
                               ^  <- parse by class QuoteVistor\
test" };

const gm = 234;
  ; ;; ;

var i = 100 / 10 * 123.555/gm; // comment line
//          ^  <- parse by class SlashVisitor

var HTMLIZE_TEXT = {
  title: `/anything/g`,
  //     ^  <- parse by class BackQuoteVistor
  description: '--- nothing ---',
  //           ^  <- parse by class QuoteVistor
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
//     ^  <- parse by class QuoteVistor
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:=`[^`]+`)?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
//    ^  <- parse by class SlashVisitor. this regexp literal although contains quote character, since it is correctly recognized as regexp literal, can avoid parse by quotevisitor. 

  ere: `(^:[\\w ]+:\$)|           (?#heading text)
(^[\\w ]+)(\\[[\\w\\+]+\\])| (?#text item)
(?:([\\-]+)(\\[ X \\]))    (?#emulate close button)`,
  
  flags: "",
  test_text: `:Key Binding:{}
}

:On comment:\`\  \"\`\"\\
------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
:On comment:\`\  \"\`\"\
------------------------------[ X ]",
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
------------------------------[ X ]',
  timestamp: 1499535241972
};
         
let name = "apple";           
// comment line.       
const templete = `function ${name}($) {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,

       // might be a very important comment line.
       things = "${ name + `anything` }",
       obj={ "\\\\": null }`

   }; \`\`
   /**
    * multi line comment...
    */
   return true;
}
`;     

; /*
  

```
#### after
> samples/es6-after.js
```javascript
var i = {} / 10;
{ i = "aaa\"" } /aaa/.test(i);
var i = 10000 / 111.77; /[/*]/.test(i);
var i = 10000 / 111.77; /\][/*]/.test(i);
[/\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/];
let gg = 10;
var re = 10000 / 111.77*gg /gg;;;;
const re4 = /\s*\(\?#.*\)\/[/*///]\s*$|#\s.*$|\s+/
let ok2 = 12.2 / 33 * .9
let ok3 = 12.2 / 33 * .9
const test_text = `:Key Binding:${ 234 }}
//                ^  <- parse by class BackQuoteVistor
}
about                   [alt+A]
    ${
    "nest-1:" + `:Key Binding:${ 234 }}
    }
        ${
            // comment line...
            "nest-2:" + `:Key Binding:${ `let abc = ${
                Boolean("")
            }` }}
            }

                // comment line in backquote
                ${

                    /**
                    * triple nested es6 template string.
                    */

                    "nest-3:" + `:Key Binding:${ 234 }}
                    }
                    // comment line in backquote
                    :On comment:\`\  \"\`\"\\

                    ------------------------------[ X ]`
                }
            :On comment:\`\  \"\`\"\\

            ------------------------------[ X ]`
        }
    :On comment:\`\  \"\`\"\\

    ------------------------------[ X ]`
    // comment line...
    }
:On comment:\`\  \"\`\"\\

------------------------------[ X ]`;
     ;
const $3 = { keyCode: $1, key: "$5\"this is\
                               ^  <- parse by class QuoteVistor\
test" };
const gm = 234;
  ; ;; ;
var i = 100 / 10 * 123.555/gm;
var HTMLIZE_TEXT = {
  title: `/anything/g`,
  description: '--- nothing ---',
  qre: "/(<button)\\s+([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*([\\w\\-]+(?:=\"[^\"]+\")?)?\\s*(>.*<\\/button>)/g.toString()",
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:=`[^`]+`)?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
  ere: `(^:[\\w ]+:\$)|           (?#heading text)
(^[\\w ]+)(\\[[\\w\\+]+\\])| (?#text item)
(?:([\\-]+)(\\[ X \\]))    (?#emulate close button)`,
  flags: "",
  test_text: `:Key Binding:{}
}

:On comment:\`\  \"\`\"\\
------------------------------[ X ]`,
  test_textQ: ":Key Binding:\
\
:On comment:\`\  \"\`\"\
------------------------------[ X ]",
  test_textS: ':Key Binding:\
\
:On comment:\`\ \' \"\`\"\
------------------------------[ X ]',
  timestamp: 1499535241972
};
let name = "apple";
const templete = `function ${name}($) {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,
       // might be a very important comment line.
       things = "${ name + `anything` }",
       obj={ "\\\\": null }`

   }; \`\`
   /**
    * multi line comment...
    */
   return true;
}
`;
;
```
## performance

> es6.js 4,472 bytes,  
> with remove blank line and whitespaces and without (at node v12.1.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.5.1 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v12.1.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 59.419595%
[version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 187.310600 ms, total average for each run: 0.093655 ms
}
[version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 111.299200 ms, total average for each run: 0.055650 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 198.380ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 183.102ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 186.404ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 186.504ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 188.868ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 185.683ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 186.058ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 185.650ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 186.546ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 185.911ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 112.131ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 110.699ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 110.772ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 110.323ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 113.002ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 110.962ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 111.436ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 111.674ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 111.096ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 110.897ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-false.js written...
es6-rm_ws-true.js written...
```

> at node v8.4.0
```ts
> rm-cstyle-cmts@1.5.1 bench
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v8.4.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 65.386043%
[version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 221.392200 ms, total average for each run: 0.110696 ms
}
[version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 144.759600 ms, total average for each run: 0.072380 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 237.782ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 218.730ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.479ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.454ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.394ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 215.375ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 223.539ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 234.917ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 216.025ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 218.227ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.5.1, case: { source: es6.js@4,472 bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 144.749ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 143.295ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 143.511ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 143.524ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 143.496ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 144.976ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 145.118ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 144.871ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 145.422ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 148.634ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-true.js written...
es6-rm_ws-false.js written...
```

## Regarding Verification of Regular Expression Literals:

>
>if regex literals contains quote marks and so on,  
>since the parse of QuoteVisitor class fails, it is necessary to skip regular expression literals.
>
>also, most regular expression literals can be detected,  
>in some cases incorrect detection is done in numerical calculation statement using "/".
>
>but in this program, this is not important :-
>

```php

\/                   # regexp literal start@delimiter
  (?![?*+\/])        # not meta character "?*+/" @anchor
  (?:                # start non-capturing group $1
    \\[\s\S]|        # escaped any character, or
    \[               # class set start
      (?:            # non-capturing group $2
        \\[\s\S]|    # escaped any character, or
        [^\]\r\n\\]  # without class set end, newline, backslash
      )*             # end non-capturing group $2 (q: 0 or more
    \]|              # class set end, or
    [^\/\r\n\\]      # without slash, newline, backslash
  )+                 # end non-capturing group $1 (q: 1 or more
\/                   # regexp literal end@delimiter
(?:                  # start non-capturing group $3
  [gimuy]+\b|        # validate regex flags, but this pattern is imcomplete
)                    # end non-capturing group $3
(?![?*+\/\[\\])      # not meta character [?*+/[\] @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
