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
    this.FROMBLOCK = 5500000; //contract creation block: 5521001 5447345    5191456 5191455-5500000
    this.TOBLOCK =   5500050; //latest or contract freeze block
    this.verbose = false; //boolean. if set to true all addresses will be printed in the console else a single line will be updated
    this._setConnProvider("https://mainnet.infura.io/3pwc8IbEcX85hRFzSVoi", "HttpProvider"); //default = HttpProvider [WebsocketProvider,IpcProvider]
    //No edits needed below
    //init contracts see ./contracts.config.json
    this.contracts = {};
    this._initContracts();

    //just some ugly hacking
    this.err_addrs = [];//keep track of addresses/calls that gave errors.
    this.ittdata = {i:1,a:null};//used for printing to console.

  }

  scan(){
  		var self = this;
  		console.log(colors.green.bold('Start Scanning For eosDAC Transfers: ')+colors.bold(this.FROMBLOCK)+' -> '+colors.bold(this.TOBLOCK)+'\n');
  		console.time('t1');
		this.contracts.eosDAC.getPastEvents('Transfer', {
		    fromBlock: this.FROMBLOCK,
		    toBlock: this.TOBLOCK
			}, function(error, events){
				if(error){
					console.log(error);
					return false;
				}
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

				console.log(colors.bold.underline('\nRetrieving eosDACbalances and EOS pub keys:\n'));
				console.time('t2');

				// let mapper = addr => self.getBalance(addr).then(r => [addr,r]).then( s => self.getEosKeyFromAddress(addr).then(p => s.concat(p?p:'unregistered') ));
				let mapper = addr => self.getBalance(addr).then(r => [addr,r]).then( s => self.getEosKeyFromAddress(addr).then(p => s.concat(p) )).then(x => self.printToConsole(x));

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
		let mapper = l => self.getBalance(l[0]).then(r => l.concat(r)).then(x => self.printToConsole(x));
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

  getEosKeyFromAddress(addr){
  	return this.contracts.eosCrowdSale.methods.keys(addr).call().then(function (p) {
      // console.log(p);
      return p?p:0;
      
    })
    .catch(console.error);
  }
  
  //method to get the 'latest' eosDAC balance from a single address. returns promise.
  getBalance(t){
  	var self = this;
	  	return this.contracts.eosDAC.methods.balanceOf(t).call().then(function (result) {	  		
	  		let amount = (result/Math.pow(10, 18)).toFixed(self.precision);
	        // console.log( t + ' -> ' + colors.bold(amount));
	        // self.printToConsole('['+self.ittdata.i+'-'+self.ittdata.a+'] '+t + ' -> ' + colors.bold(amount));
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

  printToConsole(arr){
  	if(this.ittdata.i != 1 || !this.verbose){
	  	process.stdout.clearLine();
	    process.stdout.cursorTo(0);
  	}
  	let newline = this.verbose?'\n':'';
    // process.stdout.write(arr.join(' : ')+newline);
    let text = typeof arr == 'string' ? arr : arr.join(' : ');
    text = '['+this.ittdata.i+'-'+this.ittdata.a+'] ' + text;
    process.stdout.write(text+newline);


    if(this.ittdata.i == this.ittdata.a){
    	process.stdout.write('\n\n');
    }
    this.ittdata.i++;

    return arr;// return to the pmap function.

  }

  _initContracts(){
  	const contrs = require('./contracts.config.json');
  	this.contracts.eosDAC = new this.web3.eth.Contract(contrs.eosDAC.abi, contrs.eosDAC.contractAddress);
  	this.contracts.eosCrowdSale = new this.web3.eth.Contract(contrs.eosCrowdSale.abi, contrs.eosCrowdSale.contractAddress);

  }
  _setConnProvider(url, type = 'HttpProvider'){

	this.web3 = new Web3(new Web3.providers[type](url));  //http://localhost:8545
	console.log(this.web3.providers);
  }

}//end class

let test = new eosDacTool();
test.scan();
// test.getBalancesFromCsv("./genesis_snapshot_example/snapshotsmall.csv"); //see output folder for example output of the big dataset.
// test.getEosKeyFromAddress('0x9693E022E4b32d15e6C0F0EF81b5E10efD359377');
