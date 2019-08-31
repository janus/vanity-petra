import {init,  g1_add_s, g2_add_s, g1_get_one_s, g2_get_one_s, gt_get_one_s, g1_get_zero_s, g2_get_zero_s, gt_get_zero_s, g1_mul_s, g2_mul_s, g1_neg_s, g2_neg_s, gt_mul_s, gt_inverse_s, pairing_s, hash_to_g1_s, hash_to_g2_s } from './pairiii.js';

let rev = v => { var z = ""; while (v.length > 0) { z = v.substr(0, 2) + z; v = v.substr(2); } return z; }
let fixEndian = w => { return w.split(":").map(rev).join(":"); } // From turquoise to indigo and the other way round
let normalize = s => (s ? s.toLowerCase() : s)

class Scalar { constructor(s) { 
    //console.log(`nw scalar = '${s}'`);
    this.s = normalize(s);  } 
    static fromBuffer(b) {
        let q = [], qwords = new Uint8Array(b.buffer);
        for (let x in qwords) q.push(qwords[x]);
        return new Scalar(q.map((z, i) => ('0' + (z & 0xFF).toString(16)).slice(-2) + ((i + 1) % 8 == 0 ? ':' : '')).join(''));
    }
}

const bls12381Modulus = new Scalar(fixEndian("73EDA753299D7D48:3339D80809A1D805:53BDA402FFFE5BFE:FFFFFFFF00000001:"));  

class G1 { constructor(s) { this.s = normalize(s); }
    static getOne() { return new G1(g1_get_one_s()); }
    static getZero() { return new G1(g1_get_zero_s()); }
    static mapToElement(data) { return new G1(hash_to_g1_s(data)); }
    static publicFromPrivateKey(privateKeyScalar) { return fixEndian(privateKeyScalar.s) < fixEndian(bls12381Modulus.s) ? G1.getOne().mul(privateKeyScalar) : new G1(); }

    mul(scalar) { console.log("G1mul"); return new G1(g1_mul_s(this.s, scalar.s)); }
    add(g1) { return new G1(g1_add_s(this.s, g1.s)); }
    neg() { return new G1(g1_neg_s(this.s)); } 
}

class G2 { constructor(s) { this.s = normalize(s); }
    mul(scalar) { console.log("G2mul"); return new G2(g2_mul_s(this.s, scalar.s)); }
    isValid() { return this.s; }

    static getOne() { console.log("G2::getOne();"); return new G2(g2_get_one_s()); }
    static getZero() { return new G2(g2_get_zero_s()); }
    static mapToElement(data) { return new G2(hash_to_g2_s(data)); }
    static publicFromPrivateKey(privateKeyScalar) { 
        //console.log(`privateKeyScalar.s < bls12381Modulus.s = ${privateKeyScalar.s < bls12381Modulus.s}\nprivateKeyScalar.s = ${privateKeyScalar.s}\n < bls12381Modulus.s = ${bls12381Modulus.s}`);
        //console.log(`privateKeyScalar.s < bls12381Modulus.s = ${fixEndian(privateKeyScalar.s) < fixEndian(bls12381Modulus.s)}\nprivateKeyScalar.s = ${privateKeyScalar.s}\n < bls12381Modulus.s = ${bls12381Modulus.s}`);
        return fixEndian(privateKeyScalar.s) < fixEndian(bls12381Modulus.s) ? G2.getOne().mul(privateKeyScalar) : new G2(); }

    add(g2) { return new G2(g2_add_s(this.s, g2.s)); }
    neg() { return new G2(g2_neg_s(this.s)); } 
}

class G1G2 { constructor(g1, g2) { this.g1 = g1; this.g2 = g2; } }

class GT { constructor(s) { this.s = normalize(s); }
    static getOne() { return new GT(gt_get_one_s()); }
    static getZero() { return new GT(gt_get_zero_s()); }
    static fromPairing(g1, g2) { return new GT(pairing_s(g1.s, g2.s)); }
    static fromMultiPairing(g1g2s) { return g1g2s.reduce((a, c) => a.mul(GT.fromPairing(c.g1, c.g2)), GT.getOne()); }

    mul(gt) { return new GT(get_mul_s(this.s, gt.s)); }
    inv() { return new GT(gt_inverse_s(this.s)); }
}

class BonehLynnShacham {
    static generatePublicKey(secretScalar) { return G2.publicFromPrivateKey(secretScalar); }
    static sign(elementG1, secretScalar) { return elementG1.mul(secretScalar); }
    static verify(publicKeyG2, hashedMessageG1, signedHashedMessageG1) { return GT.fromPairing(signedHashedMessageG1, G2.getOne()) == GT.fromPairing(hashedMessageG1, publicKeyG2); }
}

var initialized = false;
let ensureReady = async () => { if (!initialized) { let blsInit = await init(); initialized = true; return blsInit; } }

export { ensureReady, Scalar, G1, G2, GT, BonehLynnShacham, G1G2 }