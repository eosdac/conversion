"use strict";
/* 
This script still needs work but I have good ideas ;-)
Author: Kas
*/
const Web3 = require('web3');
const fs = require('fs');
const colors = require('colors/safe');
const path = require('path');
const pMap = require('p-map');

class readMapping {
  constructor() {
  	//https://ropsten.etherscan.io/address/0x1d9ef0f23e26f6a533aef75558a11eeb91e59d66
    this.contractAddress = '0x1D9ef0F23e26f6a533aEf75558a11EeB91E59d66';
    //proof of ownership contract abi 
    this.abi = [ { "anonymous": false, "inputs": [ { "indexed": false, "name": "eospub", "type": "string" }, { "indexed": false, "name": "sender", "type": "address" } ], "name": "Poosh", "type": "event" }, { "constant": false, "inputs": [ { "name": "_eospub", "type": "string" } ], "name": "resqueEosDacTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "seeMyKey", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ];
    //connect to eth node
    this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/3pwc8IbEcX85hRFzSVoi"));  //http://localhost:8545
    //init contract
    this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
    this.FROMBLOCK=3305209;
    this.TOBLOCK='latest';

  }


  scan(){
  		var self = this;
  		console.log(colors.green.bold('Start Scanning For eosDACPoosh Token Resques: ')+colors.bold(this.FROMBLOCK)+' -> '+colors.bold(this.TOBLOCK)+'\n');

    //scan for proof of ownershp events in a block range
		this.contract.getPastEvents('Poosh', {
		    fromBlock: this.FROMBLOCK,
		    toBlock: this.TOBLOCK
			}, function(error, events){

				console.log('Found '+colors.bold(events.length)+' Poosh events.');

				// for (let i=0; i<events.length; i++) {
				// 	let eventObj = events[i];
				// 	console.log(eventObj);
				// 	// temp.add(eventObj.returnValues['from']);//probably not necessary but include anyway.
				// 	// temp.add(eventObj.returnValues['to']);
				// }

        //for now just console.log
        
				console.log(events[events.length-1]);
				
				});
	


  }


 



}//end class

let test = new readMapping();
test.scan();
