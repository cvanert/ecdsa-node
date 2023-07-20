import { useState, useReducer } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

let cryptoData = {};

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

    let message = "";
    let validity = false;
    let finalSenderAddress = "";

  function isValid(sig, msg, pub) {
    return secp256k1.verify(sig, msg, pub);
  }

  function hashMessage(sendAddress, amount, recipientAddress) {
    if (address.length > 0 && sendAmount.length > 0 && recipient.length > 0) {
      cryptoData.message = toHex(keccak256(utf8ToBytes(`Address: ${sendAddress}, Amount: ${amount}, Recipient: ${recipientAddress}`)));
      cryptoData.address = sendAddress;
      cryptoData.amount = amount;
      cryptoData.recipient = recipientAddress;
      message = cryptoData.message;
      return cryptoData.message;
    }
  }

  function reducer(signature, action) {
    if (action.type === 'get_signature') {
      if (address.length < 1 || sendAmount.length < 1 || recipient.length < 1) {
        return alert("Fill in missing fields.");
      } else {

        let privateKeyUint8Arr = Uint8Array.from(privateKey.split(','));

        // Clear Private Key
        setPrivateKey("");

        try {
          signature = secp256k1.sign(cryptoData.message, privateKeyUint8Arr);
          // Clear privateKeyUint8Arr
          privateKeyUint8Arr = [];

          cryptoData.signature = signature;

          cryptoData.recoveredPublicKey = signature.recoverPublicKey(cryptoData.message);
          cryptoData.recoveredPublicKeyHex = cryptoData.recoveredPublicKey.toHex();

          let senderAddress = keccak256(cryptoData.recoveredPublicKey.toRawBytes().slice(1)).slice(-20);
          cryptoData.recoveredSenderAddress = toHex(senderAddress);

          return `{r: ${signature.r}, s: ${signature.s}}`;
        } catch(e) {
          return alert("Reenter values from Uint8Array of Private Key, separated by commas (e.g., 1,2,3...). Remember to exclude enclosing brackets.");
        }
      }
    }
    throw Error('Unknown action.');;
  }

  const [signature, dispatch] = useReducer(reducer, "Digital Signature will appear here after entering Private Key above");

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        recipient,
        amount: parseInt(sendAmount),
        message,
        validity,
        finalSenderAddress,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          required
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={cryptoData.recipient = setValue(setRecipient)}
          required
        ></input>
      </label>

      <label>
        Message Hash
        <span>
          { hashMessage(address, sendAmount, recipient) }
        </span>
      </label>

    <fieldset>
      <legend>Obtain Digital Signature</legend>
      <div>
        <label>
          Private Key: 
          Enter values from Uint8Array of Private Key, separated by commas (e.g., 1,2,3...).
          Exclude brackets
          <input

            placeholder=""
            value={privateKey}
            onChange={setValue(setPrivateKey)}
          ></input>
        </label>
      </div>
      <div>
      <button
          type="button" 
          className="button" 
          value="Digitally Sign"
          onClick={() => {
            dispatch ({type: 'get_signature'})
          }}>Digitally Sign
        </button>
      <label>
        Digital Signature
        <span>
          {signature}
        </span>
      </label>
      </div>
      </fieldset>

      <input type="submit" className="button" value="Transfer" onClick={() =>{
        let hashedMessage = hashMessage(address, sendAmount, recipient);
        validity = isValid(cryptoData.signature, hashedMessage, cryptoData.recoveredPublicKey.toHex());
        finalSenderAddress = address;
        if (address.length < 1 || sendAmount.length < 1 || recipient.length < 1 || signature.length < 1) {
          return alert("Fill in missing fields.");
        }
        return validity;
      }}/>
    </form>
  );
}

export default Transfer;
