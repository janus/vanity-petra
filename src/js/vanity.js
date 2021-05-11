/* eslint-env worker */
const keccak = require('keccak');
const randomBytes = require('randombytes');
const rlp = require('rlp')

let bls_ = require('./bls/bls');

const step = 500;

const  DefaultDataDirName = "petrichor";

/**
 * Transform a private key into an address
 */ 
const privateToPublic = secretBytes => bls_.BonehLynnShacham.generatePublicKey(secretBytes);
const pubToAddress = p => keccak('keccak256').update(Buffer.from(p)).digest('hex').slice(-40);

const signMessage = (hashMessage, secretBytes) => bls_.BonehLynnShacham.sign(hashMessage, secretBytes);

const verifyMessage = (publicKeyG2, hashedMessage, signedHashedMessageG1) => bls_.BonehLynnShacham.verify(publicKeyG2, hashedMessage, signedHashedMessageG1);

function getAddressFirstByte(pub) {
    let firstByte = keccak('keccak256').update(Buffer.from(pub)).digest().slice(-20)[0];
    return firstByte;
}

function toAddress(pub) {
    if(!pub) return false;
    return keccak('keccak256').update(Buffer.from(pub)).digest().slice(-20);

}

/**
 * Create a wallet from a random private key
 * @returns {{address: string, privKey: string}}
 */
const getRandomWallet = async () => {
    let randbytes, X = 0;
    let pub;
    randbytes = randomBytes(32);
    try {
        await bls_.ensureReady();
        pub = privateToPublic(randbytes);
        let addr = toAddress(pub.s);
        while(!addr) {
            randbytes = keccak('keccak256').update(randbytes).digest();
            pub = privateToPublic(randbytes);
            addr = toAddress(pub.s);
            console.log(`Attempt ${X}`); X = X + 1;
            
        }

        return {
            address: pubToAddress(pub.s),
            privKey: randbytes.toString('hex'),
            pub: pub
        };

    } catch(err) {
        console.error("Error from init " + err);
    }

};

const hashComplete = (pub, hash) => {
    const hash1 = keccak('keccak256').update(DefaultDataDirName);

    const hash2 = hash1._clone();

    const hash3 = hash2.update(Buffer.from(pub.s));
    const hash4 = hash3._clone();

    return hash4.update(hash).digest();


}

const signMsg = async (messageRLP, secretBytes) =>  {
    try {
        let hashedMessage = keccak('keccak256').update(messageRLP).digest();

        let pub = privateToPublic(secretBytes);
        hashedMessage = hashComplete(pub, hashedMessage);
        //let secretBytes = Buffer.from(wallet.privKey, 'hex');
    
        let signed  = signMessage(hashedMessage, secretBytes);
        return {
            "signed": signed.s,
            "pubKey": pub,
            "hashed": hashedMessage
        };
    } catch(err) {
        console.error("Error from signing Message" + err);
    }


}

//sign(Buffer.from("44ac43b4c79c2c324fa9448c0ed5472bc492e5a5795535208518d31b3de5417c","hex"),'{from: "0xF13E0AbCcffeB7579737f94A368b4A1781a1E996",to: "0xf13b0a9d36b2bebef9108bd1d17cc5ffb3323069",value: "0x6f05b59d3b20000",gas: "0x5208",gasPrice: "0x4a817c800",nonce: 7}');

let my = [7, "0x4a817c800","0x5208", "0xf13b0a9d36b2bebef9108bd1d17cc5ffb3323069", "0x6f05b59d3b20000", undefined, [] ]
//[ nonce, gasPrice, gas, to, value, data, [signed, PublicKey]]
function rlpMessage(arguments){
    return rlp.encode(arguments).toString('hex')
}

async function signTx(arguments, secretBytes) {
    let rlped = rlpMessage(arguments);
    let signed = await signMsg(rlped, secretBytes);

    arguments[arguments.length - 1][0] = '0x' + Buffer.from(signed.pubKey.s).toString('hex')
    arguments[arguments.length - 1][1] = '0x' + Buffer.from(signed.signed).toString('hex')
    return rlpMessage(arguments);
}


//signTx(my);

//async function mikMi(arg){
//    let wallet = await getRandomWallet();
//    let secretBytes = Buffer.from(wallet.privKey, 'hex');
//    console.log(await signTx(arg, secretBytes))
//}

mikMi(my);

const wallet = () => getRandomWallet();

module.exports = {
    getRandomWallet,
    wallet,
    signMsg,
    signTx
};
