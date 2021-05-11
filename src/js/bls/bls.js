const imp =   require('./pairiii.js');
//const './pairiii.js';
let init = imp.init;
let g1_add_s = imp.g1_add_s;
let g2_add_s = imp.g2_add_s;
let g1_get_one_s = imp.g1_get_one_s;
let g2_get_one = imp.g2_get_one;
let g2_mul = imp.g2_mul;
let g1_mul = imp.g1_mul;
let hash_to_g1 = imp.hash_to_g1;
let pairing = imp.pairing;
let gt_get_one = imp.gt_get_one;
let gt_get_one_s = imp.gt_get_one_s;
let g1_get_zero_s = imp.g1_get_zero_s;
let g2_get_zero_s = imp.g2_get_zero_s;
let gt_get_zero_s = imp.gt_get_zero_s;
let g1_mul_s = imp.g1_mul_s;
let g2_mul_s = imp.g2_mul_s;
let g1_neg_s = imp.g1_neg_s;
let g2_neg_s = imp.g2_neg_s;
let gt_inverse_s = imp.gt_inverse_s;
let pairing_s = imp.pairing_s;
let hash_to_g1_s = imp.hash_to_g1_s;
let  hash_to_g2_s = imp.hash_to_g2_s;


const ARRAY8LENGTH = 96;
const ARRAY64LENGTH = 4;
let rev = v => { var z = ""; while (v.length > 0) { z = v.substr(0, 2) + z; v = v.substr(2); } return z; }
let fixEndian = w => { return w.split(":").map(rev).join(":"); } // From turquoise to indigo and the other way round
let normalize = s => (s ? s.toLowerCase() : s)

function isLessThanBls12381Modulus(secret , bls12381Modulus) {
    const N = 20;
    for(let i = 0; i < N; i++ ) {
        if(bls12381Modulus[i] > secret[i]){
            return true;
        }
        if(secret[i] > bls12381Modulus[i]) {
            return false;
        }
    }
    return false;
}

function isEqual(a, b) {
    for(let i = 0; i < a.length; i++){
        if(a[i] !== b[i]) return false;
    }
    return true;
}
class Scalar { constructor(s) { 
    this.s = normalize(s);  } 
    static fromBuffer(b) {
        let q = [], qwords = new Uint8Array(b.buffer);
        for (let x in qwords) q.push(qwords[x]);
        return new Scalar(q.map((z, i) => ('0' + (z & 0xFF).toString(16)).slice(-2) + ((i + 1) % 8 == 0 ? ':' : '')).join(''));
    }
}

//const bls12381Modulus = new Scalar(fixEndian("73EDA753299D7D48:3339D80809A1D805:53BDA402FFFE5BFE:FFFFFFFF00000001:"));  
const bls12381Modulus = [0x73, 0xED, 0xA7, 0x53, 0x29, 0x9D, 0x7D, 0x48, 0x33, 0x39, 0xD8, 0x08, 0x09, 0xA1, 0xD8, 0x05, 0x53, 0xBD, 0xA4, 0x02, 0xFF, 0xFE, 0x5B, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x01]  ;

class G1 { constructor(s) {this.s = s; }
    static getOne() { return new G1(g1_get_one_s()); }
    static getZero() { return new G1(g1_get_zero_s()); }
    static mapToElement(data) { 
        var result = new Uint8Array(48);
        var wy = hash_to_g1(data, result);
        var ret = new G1(wy);
        return ret; }
    static publicFromPrivateKey(privateKey) { return isLessThanBls12381Modulus(privateKey, bls12381Modulus) ? G1.getOne().mul(privateKeyScalar) : new G1(); }

    mul(privateKey) { 
        var result = new Uint8Array(48);
        var ret =  new G1(g1_mul(this.s, new Uint8Array(privateKey), result));
        return ret;

    }
    add(g1) { return new G1(g1_add_s(this.s, g1.s)); }
    neg() { return new G1(g1_neg_s(this.s)); } 

    hash_to_g1(hash) {
        var result1 = new Uint8Array(ARRAY8LENGTH);
        var ret = new G1(hash_to_g1(hash, result1));
        return ret;
    
    }
}

class G2 { constructor(s) {this.s = s; }
        mul(privateKey) { 
        var result = new Uint8Array(ARRAY8LENGTH);
        var ret =  new G2(g2_mul(this.s, new Uint8Array(privateKey), result));
        return ret;

    }
    isValid() { return this.s; }

    static getOne() { var result = new Uint8Array(ARRAY8LENGTH); return new G2(g2_get_one(result)); }
    static getZero() { return new G2(g2_get_zero_s()); }
    static mapToElement(data) { return new G2(hash_to_g2_s(data)); }
    static publicFromPrivateKey(privateKey) { 
        return isLessThanBls12381Modulus(privateKey, bls12381Modulus) ? G2.getOne().mul(privateKey) : new G2(); }

    add(g2) { return new G2(g2_add_s(this.s, g2.s)); }
    neg() { return new G2(g2_neg_s(this.s)); } 
}

class G1G2 { constructor(g1, g2) { this.g1 = g1; this.g2 = g2; } }

class GT { constructor(s) { this.s = s; }
    static getOne() { 
        var result = new Uint8Array(ARRAY8LENGTH); return new GT(gt_get_one(result));
        }
    static getZero() { return new GT(gt_get_zero_s()); }
    static fromPairing(g1, g2) { 
        var result = new Uint8Array(12 * 48);
        var ret =  new GT(pairing(g1.s, g2.s, result));
        return ret; }

    static fromMultiPairing(g1g2s) { return g1g2s.reduce((a, c) => a.mul(GT.fromPairing(c.g1, c.g2)), GT.getOne()); }

    mul(gt) { return new GT(get_mul_s(this.s, gt.s)); }
    inv() { return new GT(gt_inverse_s(this.s)); }
}

class BonehLynnShacham {
    static generatePublicKey(secretScalar) { return G2.publicFromPrivateKey(secretScalar); }
    static sign(elementG1, secretScalar) { 
        //secretBytes, hashMessage
        let element = G1.mapToElement(elementG1);
        return element.mul(secretScalar); }
    static verify(publicKeyG2, hashedMessage, signedHashedMessageG1) { 
        let hashedMessageG1 = G1.mapToElement(hashedMessage);
        let b = GT.fromPairing(hashedMessageG1, publicKeyG2);
        let a = GT.fromPairing(signedHashedMessageG1, G2.getOne());
        return isEqual(a.s, b.s); }
}

var initialized = false;
let ensureReady = async () => { if (!initialized) { let blsInit = await init(); initialized = true; return blsInit; } }

//export { ensureReady, Scalar, G1, G2, GT, BonehLynnShacham, G1G2 }
module.exports =  { ensureReady, Scalar, G2, G1, GT, BonehLynnShacham }