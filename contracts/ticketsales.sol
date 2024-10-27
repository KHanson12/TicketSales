// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
contract TicketSale {
uint public numTickets;
uint public ticketPrice;
address public manager;
struct ticket {
	address customer;
	uint ticketId;
}
struct swapInfo {
	address customer;
	uint ticketId;	
}
struct resaleInfo {
	address customer;
	uint ticketId;
	uint ticketPrice;
}
ticket[] public ticketList;
swapInfo[] public swapList;
resaleInfo[] public resaleList;

constructor(uint tickets, uint price) public {
	numTickets = tickets;
	ticketPrice = price;
	manager=msg.sender;
	for(uint i = 1; i <= numTickets; i++) {
		ticketList.push(ticket(manager, i));
	}
	
}
function buyTicket(uint ticketId) public payable {
    	require(msg.value == ticketPrice, "Incorrect price offered.");
    	require(ticketId < numTickets && ticketId >= 0, "Ticket out of range.");
    	require(ticketList[ticketId].customer == manager, "Ticket already sold.");
    	require(getTicketOf(msg.sender) == 0, "You own a ticket already.");
	ticketList[ticketId].customer = msg.sender;
}
function getTicketOf(address person) public view returns (uint) {
	for(uint i = 0; i < numTickets; i++) {
		if(ticketList[i].customer == person) {
			return ticketList[i].ticketId;
		}
	}
	return 0;
}
function offerSwap(uint ticketId) public {
	require(getTicketOf(msg.sender) != 0, "You don't have a ticket.");
	swapList.push(swapInfo(msg.sender, ticketId - 1));
}
function acceptSwap(uint ticketId) public {
    uint thisTicket = getTicketOf(msg.sender);
    address swappedCustomer = ticketList[ticketId - 1].customer;
    require(thisTicket != 0, "You don't have a ticket.");
    require(getTicketOf(swappedCustomer) != 0, "The other customer doesn't have a ticket.");
    for (uint i = 0; i < swapList.length; i++) {
        if (swapList[i].ticketId == ticketId) {
            ticketList[thisTicket - 1].customer = swappedCustomer;
            ticketList[ticketId - 1].customer = msg.sender;
            if (i < swapList.length - 1) {
        	swapList[i] = swapList[swapList.length - 1];
    	    }
            swapList.pop();
            return;
        }
    }
}
function resaleTicket(uint price) public{
	uint thisTicket = getTicketOf(msg.sender);
	require(thisTicket != 0, "You don't have a ticket.");
	resaleList.push(resaleInfo(msg.sender, thisTicket, price));
}
function acceptResale(uint ticketId) public payable {
	bool t = false;
	uint resalePrice;
	address resellerAddress;
	uint resaleIndex;
	for(uint i = 0; i < resaleList.length; i++) {
		if(resaleList[i].ticketId == ticketId) {
			t = true;
			resalePrice = resaleList[i].ticketPrice;
			resellerAddress = resaleList[i].customer;
			resaleIndex = i;
		}
	}
	require(t == true, "Resale not found.");
	require(getTicketOf(msg.sender) == 0, "You already have a ticket.");
	require(msg.value == resalePrice, "Invalid payment.");
	uint serviceFee = resalePrice / 10;
	uint reducedPrice = resalePrice - serviceFee;
	payable(manager).transfer(serviceFee);
	payable(resellerAddress).transfer(reducedPrice);
	for(uint j = 0; j < ticketList.length; j++) {
		if(ticketList[j].ticketId == ticketId) {
			ticketList[j].customer = msg.sender;
		}
	}
	if (resaleIndex < resaleList.length - 1) {
        	resaleList[resaleIndex] = resaleList[resaleList.length - 1];
    	}	
	resaleList.pop();
}
function checkResale() public view returns (uint[] memory, uint[] memory) {
	uint[] memory ticketIds = new uint[](ticketList.length);
	uint[] memory ticketPrices = new uint[](ticketList.length);
	for(uint i = 0; i < resaleList.length; i++) {
		ticketIds[i] = resaleList[i].ticketId;
		ticketPrices[i] = resaleList[i].ticketId;
	}
	return (ticketIds, ticketPrices);
}
}
