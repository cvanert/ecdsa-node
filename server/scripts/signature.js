const secp256k1 = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

// Sign Message
async function signMessage(message, privKey) {
    console.log(message);
    const digitalSignature = await secp256k1.sign(message, privKey);
    console.log(message);
    return digitalSignature;
}

async function main() {
    const arguments = process.argv.slice(2);
    console.log(arguments);
    const [message, privateKey] = arguments;

    const [signature] = await signMessage(message, privateKey);
    console.log(signature);
}

main();