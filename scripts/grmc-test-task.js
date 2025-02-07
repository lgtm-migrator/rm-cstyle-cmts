/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2019 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="../src/index.d.ts"/>

// @ts-check
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const utils = require("./tiny/utils");
const gulp = require("gulp");
const rimraf = require("rimraf");


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @typedef TGrmcTaskArgsBase
 * @prop {string | string[]} [paths]
 * @prop {true} [progress]
 * @prop {true} [collectJSDocTag]
 * @prop {boolean} [preserveJSDoc]
 * @prop {boolean} [showNoops]
 * @prop {boolean} [cleanup] cleanup previous output then exit
 * @prop {boolean} [useExtern] scan external directory?
 * 
 * @typedef {`@${string}`} TJSDocTag
 * @typedef {TGrmcTaskArgsBase & NsGulpRmc.TOptions} TGrmcTaskArgs
 * @typedef {[TJSDocTag, number]} TPriorityEntry
 */
// ⚠️ CAVEAT:
//  In test for all files in node_modules,
//  if output directory is set immediately below working directory, vscode maybe/will be freezes
const RESULT_SRC_FILEs_OUT = "../rmc-tmp/output";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const cleanUpResults = (/** @type {() => unknown} */cb) => {
    rimraf.sync(RESULT_SRC_FILEs_OUT);
    cb();
};
/**
 * @type {TBivariant<Parameters<IRemoveCStyleComments["setListener"]>[0]>}
 */
const preserveJSDoc = ({ event, fragment }) => {
    if (event === /*EScannerEvent.MultiLineComment*/1) {
        return /^\/\*(\*|!)\s|^\/\*(?!-).+\*\/$/.test(fragment);
    }
    return false;
};
/**
 * @param {string[]} content
 * @param {string} name
 */
const generateSource = (content, name)  => {
    return `const ${name} = ${JSON.stringify(content, null, 2)};
module.exports = {
  ${name}
};
`;
};
/**
 * @param {TPriorityEntry[]} content 
 */
const formatStatictics = (content) => {
    return `const jsDocTagStatistics = [
  ${content.map(entry => `["${entry[0]}", ${entry[1]}]`)
    .reduce((acc, value/*, idx*/) => {
        return acc + value + ",\n  ";
        // return acc + value + (idx && !(idx % 5) ? ",\n  ": ", ");
    }, "")}
];
module.exports = {
  jsDocTagStatistics
};
`;
};

/**
 * @param {TDetectedReContext} context 
 * @param {TPriorityEntry[]} tagPriorityEntries 
 * @param {NsGulpRmc.TTimeSpanEntry} timeSpans 
 * @param {number} pending 
 * @param {() => void} cb
 */
const final = (context, tagPriorityEntries, timeSpans, pending, cb) => {
    /**
     * @type {Parameters<typeof utils.writeTextUTF8>[2]}
     */
    const writeCallback = () => {
        --pending === 0 && cb();
    };
    context.uniqReLiterals.length && utils.writeTextUTF8(
        generateSource(context.uniqReLiterals, "reLiterals"),
        "./tmp/grmc-detected-reLiterals.js",
        writeCallback
    );
    tagPriorityEntries.length && utils.writeTextUTF8(
        formatStatictics(tagPriorityEntries),
        "./tmp/grmc-detected-jsdocTags.js",
        writeCallback
    );
    timeSpans.length && utils.writeTextUTF8(
        JSON.stringify(timeSpans, null, 2),
        "./tmp/grmc-time-spans.json",
        writeCallback
    );
};


/**
 * #### `gulp-rm-cmts` test task Main
 * 
 * @param {typeof import("../src/gulp")} grmc gulp-rm-cmts package
 * @param {TGrmcTaskArgs} settings
 * @param {"cjs" | "esm"} mode 
 */
 async function task(
    grmc, settings, mode = "cjs"
) {

    const BASE_PREFIX = settings.useExtern ? "[If you want to scan external node_modules directory etc., set path here]" : ".";
    /**
     * **Scan all node module pakcages and strip comments and blank line from types of javascript source**.
     * 
     * 📝 contents that are not text or types that are not of javascript source are passed through.
     */
    const SCAN_SRC_PREFIX = BASE_PREFIX + "/node_modules/**/";
    //*
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}{*,\.*,\.*/*}`;
    /*/
    const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{js,mjs,cjs}`;
    // const SCAN_SRC_FILEs = `${SCAN_SRC_PREFIX}*.{js,jsx,ts,tsx}`;
    //*/

    //
    // - - - - - jsdoc tag detection [2020/4/14]
    //
    /** @type {Map<TJSDocTag, number>} */
    const tagStatistics = new Map();
    let inlineSourceMap = 0;

    /**
     * @param {boolean} iswalk
     * @returns {IScanEventCallback}
     */
    const emitListener = (iswalk = false) => {

        const collectTag = settings.collectJSDocTag;
        /**
         * @param {object} context
         * @param {TScannerEventContext["event"]} context.event
         * @param {TScannerEventContext["fragment"]} context.fragment
         */
        return ({ event, fragment }) => {
            if (event === /*ScannerEvent.MultiLineComment*/1) {
                if (collectTag && /^\/\*\*[^*]/.test(fragment)) {
                    const re = /(?<=[\s\*{])@\w+(?=\s)/g; // regex for correct detection
                    /** @type {RegExpExecArray} */
                    let m;
                    while (m = re.exec(fragment)) {
                        const tag = /** @type {TJSDocTag} */(m[0]);
                        let count = tagStatistics.get(tag) || 0;
                        tagStatistics.set(tag, count + 1);
                    }
                }
            }
            else if (event === /*ScannerEvent.SingleLineComment*/0) {
                if (/^\/\/# sourceMappingURL=data:application/.test(fragment)) {
                    // !silent && console.log(`\ninline source map detected=[${fragment.substring(0, 48)}...]`);
                    inlineSourceMap++;
                }
            }
            return iswalk;
        };
    };

    /**
     * @returns {TPriorityEntry[]}
     */
    const getTagStatistics = () => {
        /**
         * @type {Iterator<TPriorityEntry, TPriorityEntry>}
         */
        const entries = tagStatistics.entries();
        /** @type {TPriorityEntry[]} */
        const ret = [];
        do {
            const { value, done } = entries.next();
            if (done) break;
            ret.push(value);
        } while (1);

        return ret.sort((a, b) => {
            const diff = a[1] - b[1];
            return diff === 0 ? a[0].localeCompare(b[0]): diff;
        });
    };

    /**
     * ✅ check at own environment
     * 
     * 1. yarn grmc-test:cjs
     * 2.
     *   + search on vscode:
     *      search   - ^\s*$
     *      includes - ../rmc-tmp/output/*
     *
     *   + grep ^\s*$ ../rmc-tmp/output -rl (or -rC 1
     * 
     * 3. Is the blank line found only inside the backquoted string? grep ^\s*$ ../rmc-tmp/output -rC 1
     * 
     * @returns {Promise<void>}
     */
    const grmcBatchTest = () => {

        console.log(settings);
        // 2020/4/14
        grmc.getRmcInterface().setListener(
            !settings.preserveJSDoc ? emitListener(settings.isWalk) : preserveJSDoc
        );

        return new Promise(resolve => {
            /** @type {string | string[]} */
            console.time(`[batch-rmc-test:${mode}]`);
            gulp.src(settings.paths || SCAN_SRC_FILEs).pipe(
                grmc.getTransformer({
                    // preserveBlanks: true,
                    collectRegex: settings.collectRegex,
                    renderProgress: settings.progress,
                    isWalk: settings.isWalk,
                    timeMeasure: settings.timeMeasure,
                    extraExtensions: settings.extraExtensions,
                    disableDefaultExtentions: settings.extraExtensions ? true: void 0,
                    // 2022/5/7
                    highWaterMark: +(settings.highWaterMark) || void 0
                })
            ).pipe(gulp.dest(RESULT_SRC_FILEs_OUT)).on("end", () => {
    
                console.log("\n");
                // notify completion of task.
                console.timeEnd(`[batch-rmc-test:${mode}]`);
    
                const rmc = grmc.getRmcInterface();
                const context = rmc.getDetectedReContext();
                const tagPriorityEntries = getTagStatistics();
                console.log(
                    `\ntask grmc-test done, processed: ${rmc.processed}, noops: ${rmc.noops}\n` +
                    `detected inline source map: ${inlineSourceMap}\n` +
                    `detected regex count: ${context.detectedReLiterals.length}\nunique regex count: ${context.uniqReLiterals.length}\n` +
                    `detected JSDoc tag count: ${tagPriorityEntries.length}\ndetected JSDoc tags: %o\n` +
                    `${settings.showNoops ? `noop paths: %o`: ""}`,
                    tagPriorityEntries, settings.showNoops ? grmc.noopPaths: ""
                );
                
                const timeSpans = grmc.getTimeSpans();
                let pending = +(!!context.uniqReLiterals.length) + +(!!tagPriorityEntries.length) + +(!!timeSpans.length);
                if (pending) {
                    final(
                        context, tagPriorityEntries, timeSpans, pending, resolve
                    );
                } else {
                    resolve();
                }
            });
        });
    };

    const step2 = async () => {
        // Wait for a while to avoid nodejs specific error "EPERM: operation not permitted, mkdir..."
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        // step 2. fire gulp-rm-cmts test process
        console.log("- - - step 2. fire gulp-rm-cmts test process - - -");
        return grmcBatchTest();
    };

    // step 1. cleanup prev output
    console.log("- - - step 1. cleanup prev output - - -");
    console.time("[remove-output]");
    cleanUpResults(() => console.timeEnd("[remove-output]"));

    if (!settings.cleanup) {
        await step2();
    }
}

module.exports = {
    task
};
