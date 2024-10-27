const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider({gasLimit: 1000000000000}));
const {abi, bytecode} = require('../compile');

let accounts;
let ticketSale;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  ticketSale = await new web3.eth.Contract(abi)
  	.deploy({
  		data: bytecode,
  		arguments: [10, web3.utils.toWei("0.5", "ether")]
  	})
  	.send({from:accounts[0],gasPrice: 80000000, gas: 3000000});
  

});

describe("Ticket Sales ", () => {
  it("deploys a contract", () => {
    assert.ok(ticketSale.options.address);
  });
  it("buys ticket", async () => {
    let ticket = await ticketSale.methods.ticketList(1).call();
    await ticketSale.methods.buyTicket(1).send({from: accounts[1], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    ticket = await ticketSale.methods.ticketList(1).call();
    assert.equal(ticket.customer,accounts[1]);
  });
  it("offers ticket", async () => {
    await ticketSale.methods.buyTicket(0).send({from: accounts[1], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.buyTicket(1).send({from: accounts[2], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.offerSwap(2).send({from: accounts[1], gasPrice: 80000000, gas: 30000000});
    let offeredTicket = await ticketSale.methods.swapList(0).call();
    assert.equal(offeredTicket.ticketId, 1);
    
  });
  it("swaps tickets", async () => {
    await ticketSale.methods.buyTicket(0).send({from: accounts[1], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.buyTicket(1).send({from: accounts[2], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    let firstTicket = await ticketSale.methods.ticketList(0).call();
    let secondTicket = await ticketSale.methods.ticketList(1).call();
    await ticketSale.methods.offerSwap(2).send({from: accounts[1], gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.acceptSwap(1).send({from: accounts[2], gasPrice: 80000000, gas: 30000000});
    let firstTicketSwapped = await ticketSale.methods.ticketList(0).call();
    let secondTicketSwapped = await ticketSale.methods.ticketList(1).call();
    assert.equal(firstTicketSwapped.customer, secondTicket.customer);
    assert.equal(secondTicketSwapped.customer, firstTicket.customer);
  });
  it("resales a ticket", async () => {
    await ticketSale.methods.buyTicket(0).send({from: accounts[1], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.resaleTicket(100).send({from: accounts[1], gasPrice: 80000000, gas: 30000000});
    let resales = await ticketSale.methods.checkResale().call();
    let resaleValue = await ticketSale.methods.resaleList(0).call();
    assert.equal(resaleValue.ticketId, 1);
  });
  
  it("accepts resale", async () => {
    await ticketSale.methods.buyTicket(0).send({from: accounts[1], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    let ticket = await ticketSale.methods.getTicketOf(accounts[1]).call();
    await ticketSale.methods.resaleTicket(web3.utils.toWei("0.5", "ether")).send({from: accounts[1], gasPrice: 80000000, gas: 30000000});
    await ticketSale.methods.acceptResale(1).send({from: accounts[2], value: web3.utils.toWei("0.5", "ether"), gasPrice: 80000000, gas: 30000000});
    let ticketAfter = await ticketSale.methods.getTicketOf(accounts[2]).call();
    assert(ticket == ticketAfter);
  });
});
