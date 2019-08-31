/* tslint:disable */
/**
* @param {string} a 
* @param {string} b 
* @returns {string} 
*/
export function g1_add_s(a: string, b: string): string;
/**
* @param {string} a 
* @param {string} b 
* @returns {string} 
*/
export function g2_add_s(a: string, b: string): string;
/**
* @returns {string} 
*/
export function g1_get_one_s(): string;
/**
* @returns {string} 
*/
export function g2_get_one_s(): string;
/**
* @returns {string} 
*/
export function gt_get_one_s(): string;
/**
* @returns {string} 
*/
export function g1_get_zero_s(): string;
/**
* @returns {string} 
*/
export function g2_get_zero_s(): string;
/**
* @returns {string} 
*/
export function gt_get_zero_s(): string;
/**
* @param {string} g 
* @param {string} p 
* @returns {string} 
*/
export function g1_mul_s(g: string, p: string): string;
/**
* @param {string} g 
* @param {string} p 
* @returns {string} 
*/
export function g2_mul_s(g: string, p: string): string;
/**
* @param {string} g 
* @returns {string} 
*/
export function g1_neg_s(g: string): string;
/**
* @param {string} g 
* @returns {string} 
*/
export function g2_neg_s(g: string): string;
/**
* @param {string} a 
* @param {string} b 
* @returns {string} 
*/
export function gt_mul_s(a: string, b: string): string;
/**
* @param {string} g 
* @returns {string} 
*/
export function gt_inverse_s(g: string): string;
/**
* @param {string} g1_ 
* @param {string} g2_ 
* @returns {string} 
*/
export function pairing_s(g1_: string, g2_: string): string;
/**
* @param {string} data 
* @returns {string} 
*/
export function hash_to_g1_s(data: string): string;
/**
* @param {string} data 
* @returns {string} 
*/
export function hash_to_g2_s(data: string): string;

/**
* If `module_or_path` is {RequestInfo}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {RequestInfo | BufferSource | WebAssembly.Module} module_or_path
*
* @returns {Promise<any>}
*/
export default function init (module_or_path?: RequestInfo | BufferSource | WebAssembly.Module): Promise<any>;
        