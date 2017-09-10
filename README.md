# remove cstyle comments
remove c style comments from text file(javascript source, json file etc...

## npm package name: rm-cstyle-cmts

> ### module definition
```ts
/**
 * remove c style comments interface.
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
     * @param {boolean} rm_blank_line_n_ws remove black line and whitespaces, default is "true".
     * @param {boolean} is_multi_t use multi process?, default is "false".
     */
    (source: string, rm_blank_line_n_ws?: boolean, is_multi_t?: boolean): string;
}
/**
 * remove c style comments interface.
 */
interface IRemoveCStyleCommentsModule extends IRemoveCStyleCommentsTypeSig {
    /** package version */
    readonly version: string;
}

module.exports = Object.defineProperties(...) as IRemoveCStyleCommentsModule;
```

## BUGS

* [ ] `BUG:` #cannot keep blank line at nested es6 template string, (`rm_blank_line_n_ws=true`, at src/ts/index.ts
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
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
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
const templete = `function ${name}() {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,

       // might be a very important comment line.
       things = "${name}",
       obj={}`

   };
   /**
    * multi line comment...
    */
   return true;
}
`;     

;
  

```
#### after
> samples/es6-after.js
```javascript
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
  re: /(<button)\s+([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*([\w\-]+(?:="[^"]+")?)?\s*(>.*<\/button>)/g.toString(),
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
const templete = `function ${name}() {
   // comment line.
   var some = ${
       // comment line...
       `12.5 / 50 * 100,
       // might be a very important comment line.
       things = "${name}",
       obj={}`

   };
   /**
    * multi line comment...
    */
   return true;
}
`;
;
```
## performance

> es6.js 4,073 bytes,  
> with remove blank line and whitespaces and without (at node v8.4.0, intel core i5-2500k 3.3ghz

```ts
> rm-cstyle-cmts@1.4.7 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v8.4.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 50.393382%
[version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 161.077700 ms, total average for each run: 0.080539 ms
}
[version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 81.172500 ms, total average for each run: 0.040586 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 169.829ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 158.374ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 173.347ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 171.184ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 156.047ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 156.152ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 156.051ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 156.210ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 157.002ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 156.581ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.762ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 80.738ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.032ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 80.808ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 80.983ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.477ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 80.870ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.590ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.443ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 81.022ms
 ------------------------ end benchmark ------------------------
--done--
es6-rm_ws-false.js written...
es6-rm_ws-true.js written...
```

> at node v5.12.0
```ts
> rm-cstyle-cmts@1.4.7 test
> node -v && node ./bin/bench/ -f samples/es6.js -l 2000 -ol 10 | node ./bin/bench/ -p

v5.12.0

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance log started...
✔ order => version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000
✔ order => version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000

✈  ✈  ✈  ✈  ✈  ✈  ✈  ✈  performance ratio: 65.332254%
[version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000] {
    average of entries: 230.056200 ms, total average for each run: 0.115028 ms
}
[version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000] {
    average of entries: 150.300900 ms, total average for each run: 0.075150 ms
}

↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  performance log   ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  
 { f: 'samples/es6.js', l: '2000', ol: '10' }
 --------------- start benchmark (remove blanks) ---------------
version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=true }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=true, loop=2000: 235.533ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 227.547ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 245.062ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 233.652ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 227.493ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 225.572ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 226.077ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 226.339ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 226.829ms
es6.js, rm_blank_line_n_ws=true, loop=2000: 226.458ms
 ------------------------ end benchmark ------------------------
 --------------- start benchmark (!remove blanks) ---------------
version: 1.4.7, case: { source: es6.js@4,073bytes, remove_blanks=false }, outerloop=10, innerloop=2000
es6.js, rm_blank_line_n_ws=false, loop=2000: 150.198ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 150.841ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 151.635ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 150.631ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 149.872ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 149.385ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 150.853ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 150.355ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 149.523ms
es6.js, rm_blank_line_n_ws=false, loop=2000: 149.716ms
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
(?![?*+\/])          # not meta character "?*+/" @anchor ...

```
as comment on samples/es6.js with descriptive explanation,

please look there.
