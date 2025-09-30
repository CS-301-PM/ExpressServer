// web3.js

import Web3 from "web3";

// You can rotate between nodes if needed
const nodes = [
  "http://127.0.0.1:8501",
  "http://127.0.0.1:8502",
  "http://127.0.0.1:8503",
];

// Pick the first node for now
const web3 = new Web3(nodes[0]);

web3.eth.defaultAccount = process.env.NODE1_PRIVATE_KEY;

export default web3;
