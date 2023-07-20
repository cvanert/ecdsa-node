const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { safe, wallets } = require('./scripts/generate');

app.use(cors());
app.use(express.json());

let balances = JSON.parse(wallets);
console.log(safe);

const avoidDoubleSpend = new Set();
let senderAddress = "";

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, message, validity, finalSenderAddress, signature } = req.body;
  
  if (!validity) {
    return res.status(401).send({ message: "Invalid signature." });
  }

  if (avoidDoubleSpend.has(signature)) {
    return res.status(401).send({ message: "Cannot reuse Digital Signature."});
  }

  senderAddress = await finalSenderAddress;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  } else {
    avoidDoubleSpend.add(signature);
    balances[sender] -= amount;
    balances[recipient] += amount;
    return res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

module.exports = app;