"use strict";
/* 
This class will get all unique ethereum addresses from Transfer events emitted by "contractAddress" in a block range and subsequentially retrieve the balance for each address
by calling "balanceOf()" of the contract. The data will be stored in a csv file and can be imported in to a Mysql table for further processing.
Author: Kas
*/
const Web3 = require('web3');
const fs = require('fs');
const colors = require('colors/safe');
const path = require('path');
const pMap = require('p-map');

class eosDacTool {
  constructor() {
  	//TODO put config in external file? exclude specific addresses like 0x0000000000000000000000000000000000E05DaC and zero eosDAC balances?
  	//TODO web interface?
  	this.output_folder = './output/'; //trailing slash important
  	this.speed = 20; //number of simultaneous rpc requests. I was able to run at 20 on infura without errors. //TODO: 'automatic' speed adjustment -> is this really needed?
  	this.precision = 18; //decimal places for output eosDAC balance. eos snapshot outputs with 4 decimals.
  	this.doublequotes = true; //boolean. output csv with double quotes around fields
    this.FROMBLOCK = 5500000; //contract creation block: 5521001 5447345    5191456
    this.TOBLOCK =   5500050; //latest or contract freeze block
    this.verbose = false; //boolean. if set to true all addresses will be printed in the console else a single line will be updated

    //No edits needed below
  	//eosdac token contract
    this.contractAddress = '0x7e9e431a0b8c4d532c745b1043c7fa29a48d4fba';
    //eosdac abi 
    this.abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeSub","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeDiv","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeMul","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeAdd","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}];
    //connect to eth node
    this.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/3pwc8IbEcX85hRFzSVoi"));  //http://localhost:8545
    //init contract
    this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
    this.err_addrs = [];//keep track of addresses/calls that gave errors.
    this.ittdata = {i:1,a:null};//used for printing to console.

  }

  scan(){
  		var self = this;
  		console.log(colors.green.bold('Start Scanning For eosDAC Transfers: ')+colors.bold(this.FROMBLOCK)+' -> '+colors.bold(this.TOBLOCK)+'\n');
  		console.time('t1');
		this.contract.getPastEvents('Transfer', {
		    fromBlock: this.FROMBLOCK,
		    toBlock: this.TOBLOCK
			}, function(error, events){

				let temp = new Set();//only keep unique entries, order does not matter.

				console.log('Found '+colors.bold(events.length)+' Transfer events.');

				for (let i=0; i<events.length; i++) {
					let eventObj = events[i];
					temp.add(eventObj.returnValues['from']);//probably not necessary but include anyway.
					temp.add(eventObj.returnValues['to']);
				}
				temp = Array.from(temp);//convert to array for efficient itteration

				console.log('And '+colors.bold(temp.length)+' unique addresses.');
				self.ittdata.a = temp.length;
				console.timeEnd('t1');

				console.log(colors.bold.underline('\nRetrieving eosDACbalances:\n'));
				console.time('t2');

				let mapper = addr => self.getBalance(addr).then(r => [addr,r]);

				pMap(temp, mapper, {concurrency: self.speed}).then(result => {
					temp = null;

					console.timeEnd('t2');
					//TODO: place this is a function because it is needed twice. see getBalancesFromCsv(file)
					if(self.err_addrs.length){
						//I don't think this will be needed but in case there are errors (for example if this.speed is too high)
						//the addresses that received an error will be written to a csv file. 
						//You can use obj.getBalancesFromCsv('./output/error_addresses_FROMBLOCK-TOBLOCK.csv') to retrieve the balances. 
						console.log(colors.bold.red('Errors '+self.err_addrs.length));
						let f = 'error_addresses_'+self.FROMBLOCK+'-'+self.TOBLOCK+'.csv';
						self.createcsv(self.err_addrs, f);
						self.err_addrs = [];
					}
					else{
						console.log(colors.bold.green('Errors: '+self.err_addrs.length));
					}

					let f = 'eosDAC_'+self.FROMBLOCK+'-'+self.TOBLOCK+'.csv';
				    self.createcsv(result, f);

				    let used = process.memoryUsage().heapUsed / 1024 / 1024;
					console.log(used);
					
				});
							
		});
  }

  //this method needs a csv file as input (eos genesis snapshot or error_addresses_x-x.csv) and will itterate over all addresses to retrieve it's eosDAC balance
  //it will output the csv file with an extra field added.
  getBalancesFromCsv(file){
  	var self = this;
  	console.log(colors.bold.underline('\nRetrieving eosDAC balances from: '+file+'\n'));
	const readline = require('readline');
	//on error?
	let temp = [];
	readline.createInterface({
	    input: fs.createReadStream(file),
	    terminal: false
	}).on('line', function(line) {
	   temp.push(line.replace(/['"]+/g, '').split(','));
	}).on('close', () => {
		let mapper = l => self.getBalance(l[0]).then(r => l.concat(r));
		self.ittdata.a = temp.length;
		pMap(temp, mapper, {concurrency: self.speed}).then(result => {
			temp = null;
			//duplicate code :(
			if(self.err_addrs.length){
				console.log(colors.bold.red('Errors '+self.err_addrs.length));
				let f = 'error_addresses_'+path.basename(file);
				self.createcsv(self.err_addrs, f);
						self.err_addrs = [];
			}
			else{
				console.log(colors.bold.green('Errors: '+self.err_addrs.length));
			}
			let f = 'eosDAC_'+path.basename(file);
			self.createcsv(result, f);
					
		});
	});
	
  }
  
  //method to get the 'latest' eosDAC balance from a single address. returns promise.
  getBalance(t){
  	var self = this;
	  	return this.contract.methods.balanceOf(t).call().then(function (result) {	  		
	  		let amount = (result/Math.pow(10, 18)).toFixed(self.precision);
	        // console.log( t + ' -> ' + colors.bold(amount));
	        self.printToConsole('['+self.ittdata.i+'-'+self.ittdata.a+'] '+t + ' -> ' + colors.bold(amount));
	        return amount;
	    }).catch(function(e){
    		console.log(colors.bold.red(e));
    		self.err_addrs.push([t]);
		});
  }
  
  //method to write a multidimentional array to a csv file.
  createcsv(tt, f){
  	!fs.existsSync(this.output_folder) && fs.mkdirSync(this.output_folder);
  	console.log('\nWriting to CSV-file: ' + colors.bold(this.output_folder + f));
  	let file = fs.createWriteStream(this.output_folder+f);
	file.on('error', function(err) { console.log(colors.bold.red(err)) });

	if(this.doublequotes){
		tt.forEach(function(v) { file.write(v.map(v => `"${v}"`).join(",") + '\n'); });
	}
	else{
		tt.forEach(function(v) { file.write(v.join(",") + '\n'); }); //no double quotes in output csv		
	}
	file.end();
  }

  printToConsole(text){
  	if(this.ittdata.i != 1 || !this.verbose){
	  	process.stdout.clearLine();
	    process.stdout.cursorTo(0);
  	}
  	let newline = this.verbose?'\n':'';
    process.stdout.write(text+newline);

    if(this.ittdata.i == this.ittdata.a){
    	process.stdout.write('\n\n');
    }
    this.ittdata.i++;
  }

}//end class

let test = new eosDacTool();
// test.scan();
test.getBalancesFromCsv("./genesis_snapshot_example/snapshotsmall.csv"); //see output folder for example output of the big dataset.
