const secp256k1 = require('secp256k1');
const ecc = require('eosjs-ecc');
const base32 = require('base32');
const colors = require('colors/safe');
const etherscan = require('etherscan-api').init('CBBCW64JQU2PNP87PJ4J5PA9XURRIF749G');
const fs = require('fs');

const Web3 = require('web3');

// var testinput =['0xC426c7d9860b4DF1c6D0cD5507DD49A42E53cE6C',
//   '0x293b27f1aD19f888941a2Ec1e818fE674F5E0419',
//   '0x506b2565e96f8606A5247618b48a188C2f7C305a',
//   '0x03F901030aCcD0BfE0dd5437861A33dB9c11F145',
//   '0xD331F7C1E812dA92ba7484368315fD2Cda9e009f',
//   '0x9e4323D760dF887779729f63fD7F8391067Df67A',
//   '0x2226590c78F9aeaFec58C49B6ae4974362fd9E35',
//   '0x981Ce18b52787c0c4E03D9273db22373FF084DfB',
//   '0xA238819b19DbaeF71C0cb91fd743b4Eb5C03e867',
//   '0x93BB955ac8270B27E29618545Cd9Ff3DE834B222',
//   '0x08dE91d9D663ED47867020343cA48BF3005f613B',
//   '0x39370CA82B8efA2B6E4875fe24dd84fF988402fb',
//   '0x69c8f479F5c9aB4bae7e566CeA29c8D406262fD0'];

class genFallback{

	constructor() {
	  this.output_folder = './output/';
	  this.initfilestream();
	  this.inputfile = './input.csv'; //one column with eth addresses.

	  this.FROMBLOCK = 5500000; //contract creation block
      this.TOBLOCK =   5500050; //latest or contract freeze block
      this._setConnProvider("https://mainnet.infura.io/3pwc8IbEcX85hRFzSVoi", "HttpProvider");
      this.contracts = {};
      this._initContracts();

	}

	async doit (){

		await this.getAllTransfers();
		// console.log(this.lookupTable);
		console.log(colors.blue.bold.underline('Generating fallback keys and account names:'));

		this.input = await this.readFile(this.inputfile);

		for (let i=0; i < this.input.length; i++) {

			this.input[i] = this.input[i].trim();
			let eoskey;
			let txhash = await this.get_first_sent_transacion_from_address(this.input[i]);

			if(txhash){
				let pubkey  = await this.get_pubkey_from_tx(txhash);
				if(pubkey){
					eoskey = this.convert_ethpub_to_eospub(pubkey);
				}
				else{
					eoskey = "no";
				}
				
			}
			else{
				eoskey = "no";
			}
			
			let accountname = this.generate_eos_accountname(this.input[i]);
			this.stream.write(this.input[i]+','+eoskey +','+accountname+ "\n");
			// this.result.push([this.input[i], eoskey]);

			let itterator = colors.yellow('['+parseInt(i+1)+'-'+parseInt(this.input.length)+'] ');
			console.log(colors.green(itterator+this.input[i]+' -> '+colors.cyan(eoskey)+' -> '+colors.magenta(accountname))  );
			await this.sleep(100); //we need to sleep because etherscan is only accepting 5 requests /sec

		}

	}

	get_first_sent_transacion_from_address(addr){
		//get the first transaction sent from the address (from === address)
		//if there is a tx initiated by the address get the txhash
		//we need the message signed by the address to retrieve it's public key.
		//we use the etherscan api for getting all tx of the address... 
		//little slow (max 5addrs/s) but it prevents us for not having to loop through all the blocks which is slower... 
		//drawback is that etherscan is centralized, however this does not mater because I only use it
		//for retrieving a txhash, which is not critical info.

		return etherscan.account.txlist(addr, 0, 'latest', 'asc')
		.then(function(list){
			var sent_tx = 0;
			list = list.result;
			

			if(list.length > 0){
				for (let i=0; i<list.length; i++) {
					// console.log(list[i].from.toLowerCase());
					if(list[i].from.toLowerCase() === addr.toLowerCase()){
						// console.log(list[i]);
						sent_tx = list[i].hash;
						break;
					}
				}
				return sent_tx;
			}
			else{
				console.log(addr+ ' has no transactions');
				return sent_tx; //null
			}

		} )
		.catch( e => { } )
	}

	get_pubkey_from_tx (tx_hash){
		//get the transaction and get the public key out of it.
	  return this.web3.eth.getTransaction(tx_hash)
	    .then( tx => {
	    	// console.log(tx);
	    	// tx.publicKey="0x3378b571334a643045a90bc9715976173daff9f97433caa4ce7a2a628b007e1dc901a206a7df98c5b4ab41011bc7e9ea62bfb2f2dcf44ffe377bce127200a308";
	    	// tx.publicKey = undefined;
	    	if( tx["publicKey"] == undefined ){
	    		return 0;
	    	}
	    	// console.log(tx.publicKey);
	    	return tx.publicKey.slice(2);
	    } )
	    .catch( e => { throw new Error(e)} )
	}

	convert_ethpub_to_eospub ( pubkey ) {
		//convert the public key to an deterministic eos pub key.
	  let buffer    = Buffer.from(pubkey, 'hex');
	  let converted = secp256k1.publicKeyConvert(Buffer.concat([ Buffer.from([4]), buffer ]), true);
	  let eoskey    = ecc.PublicKey.fromBuffer(converted).toString();
	  if(ecc.isValidPublic(eoskey) === true){
	  	// console.log('Valid eos public from ethpub: '+eoskey);
	  	return eoskey;
	  }
	  else{
	  	return 'invalid';
	  }
	}

	generate_eos_accountname(addr){
		//stolen from sandwich
		let index = this.lookupTable.indexOf(addr);
		let accountname = base32.encode( index.toString() ).replace(/=/g, "").toLowerCase();

	    if(accountname.length > 12) { throw new Error(`${accountname} is greater than 12 characters`) }
	    else { accountname = accountname.padEnd(12, "eosdac123456") }

		return accountname;
	}

	getAllTransfers(){
		console.log(colors.blue.bold.underline('Start Scanning For eosDAC Transfers:')+' '+colors.bold(this.FROMBLOCK)+' -> '+colors.bold(this.TOBLOCK)+'\n');
		var self = this;
		return this.contracts.eosDAC.getPastEvents('Transfer', {
		    fromBlock: this.FROMBLOCK,
		    toBlock: this.TOBLOCK
			}, function(error, events){
				if(error){
					console.log(error);
					return false;
				}
				let temp = new Set();//only keep unique entries

				console.log('Found '+colors.bold(events.length)+' Transfer events.');

				for (let i=0; i<events.length; i++) {
					let eventObj = events[i];
					// temp.add(eventObj.returnValues['from']);//probably not necessary but include anyway.
					temp.add(eventObj.returnValues['to']);
				}
				self.lookupTable = Array.from(temp);//convert to array for efficient itteration
				console.log('And '+colors.bold(self.lookupTable.length)+' unique addresses.\n');
		});



	}

	sleep(millis) {
		//we need to sleep, because of the etherscan api rate limit 5 requests/s
    	return new Promise(resolve => setTimeout(resolve, millis));
	}

	initfilestream(){

		!fs.existsSync(this.output_folder) && fs.mkdirSync(this.output_folder);
		let date = new Date();

		let hour = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();

		let filename = hour+'-'+minutes+'-'+seconds+'.csv';
		this.stream = fs.createWriteStream(this.output_folder+filename, {flags:'a'});

	}

	  _initContracts(){
	  	const contrs = require('./contracts.config.json');
	  	this.contracts.eosDAC = new this.web3.eth.Contract(contrs.eosDAC.abi, contrs.eosDAC.contractAddress);
	  	// this.contracts.eosCrowdSale = new this.web3.eth.Contract(contrs.eosCrowdSale.abi, contrs.eosCrowdSale.contractAddress);

	  }
	  _setConnProvider(url, type = 'HttpProvider'){

		this.web3 = new Web3(new Web3.providers[type](url));  //http://localhost:8545
		// console.log(this.web3.providers);
	  }

	 readFile(csvFilePath){
		const csv=require('csvtojson')
		return csv({noheader:true,output: "line"})
		.fromFile(csvFilePath)
		.then((jsonObj)=>{
		    // console.log(jsonObj);
		    return jsonObj;

		});
	}




}

let test = new genFallback();


test.doit();

	