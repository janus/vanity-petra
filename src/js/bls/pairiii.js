const fs  = require('fs').promises;

//const fs  = require('fs');

//const fetch = require('node-fetch');

if (typeof exports !== 'object') {
    exports = {};
}

(exports => { 

const ARRAY8LENGTH = 96;
const ARRAY64LENGTH = 4;
const ARRAY8G1LENGTH = 48;
const ARRAY64GTSLENGTH = 72;

let myWasmArray;

/**
* @param {Uint8Array} arr
* @returns {number}
*/
function converFn (arr) {
    let length = arr.length;
    let myWasmArrayPtr = exports.wasm.__wbindgen_malloc(length);
    myWasmArray = new Uint8Array(exports.wasm.memory.buffer, myWasmArrayPtr, length);
    myWasmArray.set(arr);
    return myWasmArrayPtr;
}

/**
* @param {Uint8Array} g
* @param {Uint64Array} p
* @param {Uint8Array} r
* @returns {Uint8Array}
*/
exports.g2_mul = (g, p, r) => {
    const ret = exports.wasm.g2_mul(converFn(g), ARRAY8LENGTH, converFn(p), ARRAY64LENGTH, converFn(r), ARRAY8LENGTH);
    return myWasmArray;
}

exports.hash_to_g1 = (g, r) => {
    const ret = exports.wasm.hash_to_g1(converFn(g), 32, converFn(r),  ARRAY8G1LENGTH);
    return myWasmArray;
}

/**
* @param {Uint8Array} g
* @param {Uint64Array} p
* @param {Uint8Array} r
* @returns {Uint8Array}
*/
exports.g1_mul = (g, p, r) => {
    const ret = exports.wasm.g1_mul(converFn(g), 48, converFn(p), ARRAY64LENGTH, converFn(r), ARRAY8G1LENGTH);
    return myWasmArray;
}

/**
* @param {Uint8Array} g
* @returns {Uint8Array}
*/
exports.g2_get_one = (g) => {  
    const ret = exports.wasm.g2_get_one(converFn(g), ARRAY8LENGTH);
    return myWasmArray;
}

/**
* @param {Uint8Array} g
* @returns {Uint8Array}
*/
exports.g1_get_one = (g) => {  
    const ret = exports.wasm.g1_get_one(converFn(g), ARRAY8LENGTH);
    return myWasmArray;
}

/**
* @param {Uint8Array} g
* @param {Uint64Array} p
* @param {Uint8Array} r
* @returns {Uint8Array}
*/
exports.pairing = (g, p, r) => {
    const ret = exports.wasm.pairing(converFn(g), ARRAY8G1LENGTH, converFn(p), ARRAY8LENGTH, converFn(r), ARRAY64GTSLENGTH);
    return myWasmArray;
}

/**
* @param {Uint8Array} g
* @returns {Uint8Array}
*/
exports.gt_get_one = (g) => {  
    const ret = exports.wasm.g_get_one(converFn(g), ARRAY8LENGTH);
    return myWasmArray;
}

/**
* @param {string} module
* @returns {object}
*/

exports.init = async (module) => {
    if (typeof module === 'undefined'){
        //module = `${location.origin}pairing_bg.wasm`;
        //let url  = 'https://janus.github.io/vanity-petra/';
        module = `/home/emeka/buildtool/job/amhello/gitcoin/vanity-petra/src/js/bls/pairing_bg.wasm`;

    }
    let result;
    const imports = {};

    if (module instanceof URL || typeof module === 'string' || module instanceof Request) {
        //const reesponse = fs.readFileSync("./pairing_bg.wasm");
        const response = fs.readFile(module);
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            result = WebAssembly.instantiateStreaming(response, imports)
            .catch(e => {
                console.warn("`WebAssembly.instantiateStreaming` failed. Assuming this is because your server does not serve exports.wasm with `application/exports.wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                return response
                .then(r => r.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            });
        } else {
            result = response
            .then(r => r)
            .then(bytes => WebAssembly.instantiate(bytes, imports));
        }
    } else {

        result = WebAssembly.instantiate(module, imports)
        .then(result => {
            if (result instanceof WebAssembly.Instance) {
                return { instance: result, module };
            } else {
                return result;
            }
        });
    }
    return result.then(({instance, module}) => {
        exports.wasm = instance.exports;
        exports.init.__wbindgen_wasm_module = module;
        return exports.wasm;
    });
};

return exports;
})(exports)
