const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");


const privateKey = secp256k1.utils.randomPrivateKey
const publicKey = secp256k1.getPublicKey;

// Unsafe Private Key Storage
let safe = [];
let balances = (function getCryptographic() { 
    let bals = {}
    for (var i = 0; i < 3; i++) {
        let tmpPrivateKey = privateKey();
        let tmpPublicKey = publicKey(tmpPrivateKey);
        let address = keccak256(tmpPublicKey.slice(1)).slice(-20);
        let bal = Math.floor(Math.random() * (100 - 25 +1)) + 25;
        safe.push({
            'privateKeyArray': tmpPrivateKey,
            'privateKey': toHex(tmpPrivateKey),
            'publicKey': toHex(tmpPublicKey),
            'address': toHex(address)
        })
        bals[`${toHex(address)}`] = bal;
    }
    return bals;
})();

const wallets = JSON.stringify(balances);

module.exports = {
    safe,
    wallets
};