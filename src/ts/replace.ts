/*
-----------------------------------------------------------------------

Copyright 2017 motrohi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

------------------------------------------------------------------------
*/

interface IReplacementContext {
    /** content offset(read, write */
    offset: number;
    /** replecement result */
    result: string;
    /** new line character at source. */
    newline: string;
}

interface ICharVisitor {
    /** register by self. */
    injectTo(registry: IStringMap<ICharVisitor>): void;

    /**
     * #### main function.  
     * if returns true then context has been changed.
     * @param char    character of context.offset position.
     * @param source  current replacement source.
     * @param context see IReplacementContext
     */
    visit(char: string, source: string, context: IReplacementContext): boolean;
    /** optional use. */
    // setContext(context: IReplacementContext): void;
}

// /**
//  * 
//  */
// abstract class CharVisitorBase implements ICharVisitor {

//     constructor(private characters: string, registry: IStringMap<ICharVisitor>) {
//         this.injectTo(registry);
//     }
//     injectTo(registry: IStringMap<ICharVisitor>): void {
//         const self = this;
//         this.characters.split("").forEach(ch => {
//             registry[ch] = self;
//         });
//     }
//     abstract visit(char: string, source: string, context: IReplacementContext): boolean;
// }

/**
 * correctly evaluate single quote and double quote string,  
 * and concat it to the result string.
 *```
 *   case [']: single quote
 *   case ["]: double quote
 *```
 */
class QuoteVistor implements ICharVisitor {

    // constructor(registry: IStringMap<ICharVisitor>) {
    //     super(`"'`, registry);
    // }
    public injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["'"] = this;
        registry['"'] = this;
    }
    public visit(char: string, source: string, context: IReplacementContext): boolean {
        const index = context.offset;
         // maybe will not need it. because it will apply visit as soon as quote is found.
        // if (source[index - 1] !== "\\") {
            // move next position.
        let next = index + 1;
        // toggle escape flag.
        let in_escape = false;
        // store "next" postion character. 
        let ch: string;
        // limiter
        const limiter = source.length;

        while (next < limiter) {
            if ((ch = source[next]) === "\\") {
                in_escape = !in_escape;
            } else if (!in_escape && ch === char) {
                // const str = source.substring(index, ++next);
                // console.log(`--[${str}]--`);
                // context.result += str;
                context.result += source.substring(index, ++next);
                context.offset = next;
                return true;
            } else {
                in_escape = false;
            }
            next++;
        }
        // }
        throw new TypeError(`invalid string quotes??, offset=${index}, remaining=${source.substring(index)}`);
    }
}
/**
 * In back quote string,  
 * can define template string further by enclosing it with "${" and "}",  
 * so special processing is required (at es6
 *```
 *   case [`]: back quote
 *```
 */
// NOTE: 2017/9/7 23:44:25 
// by improving the algorithm it is now possible to process correctly.
class BackQuoteVistor implements ICharVisitor {

    public injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["`"] = this;
    }

    // tslint:disable-next-line:
    public visit(char: string, source: string, context: IReplacementContext): boolean {

        const index = context.offset;
        // move next position.
        let next = index + 1;
        // toggle escape flag.
        let in_escape = false;
        // store "next" postion character. 
        let ch: string;
        // limiter
        const limiter = source.length;

        // nested template depth
        let depth = 0;
        /**
         * #### nested back quote depth.
         * this is always the same as depth or one less.
         * ```
         * (depth + (0 or -1)) === bq_depth
         * ```
         */
        let bq_depth = 0;

        LOOP: while (next < limiter) {
            // fetch "next" char, if its back slash then toggle escape state.
            if ((ch = source[next]) === "\\") {
                in_escape = !in_escape;
            } else if (!in_escape) {
                // state is not escaped then let's check [`], "${", "}".
                // however, "}" is ignore escape state?
                switch (ch) {
                    case "`":
                        if (depth > 0) {
                            if (depth - 1 === bq_depth) {    // can increment.
                                bq_depth++;
                            } else if (depth === bq_depth) { // can decrement.
                                bq_depth--;
                            }
                            // if (depth === bq_depth)
                            //     bq_depth--;
                            // else if (depth - 1 === bq_depth)
                            //     bq_depth++;
                            break;
                        }
                        if (depth === 0) {
                            context.result += source.substring(index, ++next);
                            context.offset = next;
                            return true;
                        }
                        break;
                    case "$":
                        if (source[next + 1] === "{") {
                            next += 2, depth++;
                            continue LOOP;
                        }
                        break;
                    case "}":
                        // NOTE: can be decremented only when it is nested?
                        (depth > 0 && depth - 1 === bq_depth) && depth--;
                        break;
                    default:
                        break;
                }
            } else {
                in_escape = false;
            }
            next++;
        }
        throw new TypeError(`BackQuoteVistor error: offset=${index}, remaining=--[${source.substring(index)}]--`);
    }
}

/**
 * global flag for regexp.lastIndex.  
 * rewrite the lastIndex and execute it only once.
 * 
 * `regex summary:`
 * 
 * ```
 * \/                   # regexp literal start@delimiter
 *   (?![?*+\/])        # not meta character "?*+/" @anchor
 *   (?:                # start non-capturing group $1
 *     \\[\s\S]|        # escaped any character, or
 *     \[               # class set start
 *       (?:            # non-capturing group $2
 *         \\[\s\S]|    # escaped any character, or
 *         [^\]\r\n\\]  # without class set end, newline, backslash
 *       )*             # end non-capturing group $2 (q: 0 or more
 *     \]|              # class set end, or
 *     [^\/\r\n\\]      # without slash, newline, backslash
 *   )+                 # end non-capturing group $1 (q: 1 or more
 * \/                   # regexp literal end@delimiter
 * (?:                  # start non-capturing group $3
 *   [gimuy]+\b|        # validate regex flags, but this pattern is imcomplete
 * )                    # end non-capturing group $3
 * (?![?*+\/])          # not meta character "?*+/" @anchor ...
 * ```
 */
// NOTE: regexp document -> match regexp literal@mini#nocapture
const RE_REGEXP_PATTERN = /\/(?![?*+\/])(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]\r\n\\])*\]|[^\/\r\n\\])+\/(?:[gimuy]+\b|)(?![?*+\/])/g;

/**
 * when this character appears,  
 * its necessary to verify the line comment, multiline comment, regex.  
 * will need to set the priority as (line comment || multiline comment) > regex.
 * ```
 *   case [/]: slash
 *```
 */
class SlashVistor implements ICharVisitor {

    public injectTo(registry: IStringMap<ICharVisitor>): void {
        registry["/"] = this;
    }

    public visit(char: string, source: string, context: IReplacementContext): boolean {

        // fetch current offset.
        const index = context.offset;
        // limiter.
        const length = source.length;
        // remove c style comment It's a phenomenon which cannot happen with the specification of this program...
        if (index + 1 >= length) {
            // throw new SyntaxError("invalid input source :-D");
            return false;
        }

        // fetch next char.
        let ch = source[index + 1];
        if (ch === void 0) return false;

        // check multiline comment.
        if (ch === "*") {
            // index += 2;
            // while (index < length) {
            //     if (source[index] === "*" && source[index + 1] === "/") {
            //         break;
            //     }
            //     index++;
            // }
            // context.offset = index;
            const close = source.indexOf("*/", index + 2);
            // update offset.
            context.offset = (close === -1? index : close) + 2;
            return true;
        }

        // index + 1 ...
        const x = source.indexOf(context.newline, index + 1);
        L: do {
            // check line comment.
            if (ch === "/") {
                // update offset. when new line character not found(eof) then...
                context.offset = x === -1? length: x + context.newline.length;
                // NOTE: avoid extra loops in ReplaceFrontEnd.apply()
                x === -1 || (context.result += context.newline);
                return true;
            }

            // ------------------- check regexp literal -------------------
            // NOTE: It was necessary to extract the character strings of the remaining lines...
            // const x = m? m.index: length;
            const remaining = source.substring(index, x === -1? length: x);
            // NOTE:
            //  o LF does not have to worry.
            RE_REGEXP_PATTERN.lastIndex = 0;
            // only execute once, this is important!
            const m = RE_REGEXP_PATTERN.exec(remaining);
            if (m === null) {
                return false;
            }

            // means multiline comment.
            if (remaining[m.index - 1] === "/") {
                ch = "/";
                context.result += source.substring(index, index + m.index - 1);
                continue L;
            } else {
                // update offset.
                context.offset = index + RE_REGEXP_PATTERN.lastIndex;
                context.result += source.substring(index, context.offset);
                return true;
            }

        } while (true);
        // unreachable...
        // return false;
    }
}

/**
 * create IReplacementContext.
 * @param source parsing source.
 */
function createWhite(source: string): IReplacementContext {
    // specify new line character.
    const m = /\n|\r\n|\r/.exec(source);
    return {
        offset: 0,
        result: "",
        newline: m? m[0]: ""
    };
}

/**
 * NOTE:  
 * This class is implemented to correctly judge quoted string,  
 * line comment, multiline commnet, regexp literal,  
 * and delete line comment, multiline commnet. (maybe...
 */
export class ReplaceFrontEnd {
    private visitors: IStringMap<ICharVisitor> = {};
    private subject: string;
    /**
     * 
     * @param {string} subject text content of parse target.
     */
    constructor(subject: string) {
        this.subject = subject;
        new QuoteVistor().injectTo(this.visitors);
        new BackQuoteVistor().injectTo(this.visitors);
        new SlashVistor().injectTo(this.visitors);
    }
    /**
     * set text content of parse target.
     * @param {string} s text content of parse target.
     */
    public setSubject(s: string): this {
        this.subject = s;
        return this;
    }
    /**
     * it returns result string content.
     * @return {string} line comment, multiline comment, remaining whitespace character of line are removed
     */
    public apply(): string {
        const source = this.subject;
        const limit = source.length;
        const registry = this.visitors;

        const context: IReplacementContext = createWhite(source);
        let prev_offset = 0;

        while (context.offset < limit) {
            const ch = source[context.offset];
            const visitor = registry[ch];
            if (visitor) {
                context.result += source.substring(prev_offset, context.offset);
                // if visit(...) returns true, context.offset has been updated.
                prev_offset = !visitor.visit(ch, source, context)? context.offset++: context.offset;
            } else {
                // increment scan position.
                context.offset++;
            }
        }
        // when has remaining
        if (limit - prev_offset > 0) {
            context.result += source.substring(prev_offset, context.offset);
        }

        return context.result;
    }
}
