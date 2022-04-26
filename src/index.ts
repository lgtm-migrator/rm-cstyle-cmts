/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./index.d.ts"/>
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** character scanner module */
import * as JsScanner from "./js-scanner";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const {
    apply, walk
} = JsScanner;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * number of times successfully processed
 */
let okay = 0;
/**
 * number of times the process was bypassed because the line was too long
 */
let failure = 0;

/**
 * @param {true} [showErrorMessage] 
 * @param {any} [e] 
 */
const handleError = (showErrorMessage?: true, e?: any) => {
    console.warn(
        "\n[Exception occured] The input source will be returned without any processing.",
        showErrorMessage? (e instanceof Error && e.message): ""
    );
};

const rmc = /** @type {IRemoveCStyleComments} */(
    /**
     * @param {string} source 
     * @param {TRemoveCStyleCommentsOpt} [opt]
     * @returns {string} if `options.isWalk === true`, returns original string, otherwise returns comment removed string
     */
    (source: string, opt?: TRemoveCStyleCommentsOpt): string => {

        if (typeof source !== "string") {
            throw new TypeError("invalid text content!");
        }
        if (!source.length) {
            // DEVNOTE: 2022/04/24 - check empty contents
            failure++;
            // DEVNOTE: whether return same reference or return new empty string
            return source;
        }

        opt = opt || {};
        try {
            source = apply(source, opt);
            okay++;
        } catch (e) {
            handleError(opt.showErrorMessage, e);
            failure++;
        }

        return source;
    }
) as IRemoveCStyleComments;

/**
 * @param {string} source
 * @param {TWalkThroughOpt} opt
 */
rmc.walk = (source: string, opt?: TWalkThroughOpt ) => {

    if (typeof source !== "string") {
        throw new TypeError("invalid text content!");
    }
    if (!source.length) {
        // DEVNOTE: 2022/04/26 - check empty contents
        failure++;
        return;
    }

    opt = opt || {};
    try {
        walk(source, opt);
        okay++;
    } catch (e) {
        handleError(opt.showErrorMessage, e);
        failure++;
    }
};

Object.defineProperties(rmc, {
    version: {
        /*
         * replace to version string at build time
         */
        value: "v3.3.4",
        enumerable: true
    },
    noops: {
        get: () => failure,
        enumerable: true
    },
    processed: {
        get: () => okay,
        enumerable: true
    },
    reset: {
        value: () => {
            okay = failure = 0, JsScanner.reset();
        }
    },
    getDetectedReContext: {
        value: JsScanner.getDetectedReContext
    },
    setListener: {
        value: JsScanner.setListener
    }
});

export = rmc;
