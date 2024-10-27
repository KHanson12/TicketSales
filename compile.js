const path = require('path');
const fs = require('fs');
const solc = require('solc');
const tickPath = path.resolve(__dirname, 'contracts', 'ticketsales.sol');
const source = fs.readFileSync(tickPath, 'utf8');

let input = {
  language: "Solidity",
  sources: {
    "ticketsales.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const stringInput=JSON.stringify(input);

const compiledCode=solc.compile(stringInput);

const output =JSON.parse(compiledCode);

const contractOutput=output.contracts;

const tickOutput=contractOutput["ticketsales.sol"];

const tickABI=tickOutput.TicketSale.abi;

const tickBytecode=tickOutput.TicketSale.evm.bytecode;

module.exports= {"abi":tickABI,"bytecode":tickBytecode.object};



