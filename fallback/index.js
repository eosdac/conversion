const secp256k1 = require('secp256k1');
const ecc = require('eosjs-ecc');
const colors = require('colors/safe');
var etherscan = require('etherscan-api').init('CBBCW64JQU2PNP87PJ4J5PA9XURRIF749G');


const Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('https://mainnet.infura.io/3pwc8IbEcX85hRFzSVoi'));




class genFallback{

	constructor() {
	  this.output_folder = './output/';
	  this.input_folder = '';
	  this.result = [];

	}

	async doit (addr){

		let txhash = await this.get_first_sent_transacion_from_address(addr);
		let pubkey  = await this.get_pubkey_from_tx(txhash);
		let eoskey = this.convert_ethpub_to_eospub ( pubkey );
		let accountname = "xxx.eosdac";
		this.result.push([addr, eoskey]);

		console.log(colors.green(addr+' -> '+eoskey+' -> '+accountname) );
	}

	get_first_sent_transacion_from_address(addr){
		//get the first transaction sent from the address (from === address)
		//if there is a tx initiated by the address get the txhash
		//we use the etherscan api for getting all tx of the address... 
		//little slow but it prevents us for not having to loop through all the blocks which is slower... 
		
		return etherscan.account.txlist(addr, 0, 'latest', 'asc')
		.then(function(list){
			list = list.result;
			var sent_tx = null;

			if(list.length > 0){
				for (let i=0; i<list.length; i++) {
					// console.log(list[i].from.toLowerCase());
					if(list[i].from.toLowerCase() === addr.toLowerCase()){
						console.log(list[i]);
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
		.catch( e => { throw new Error(e)} )
	}

	get_pubkey_from_tx (tx_hash){

	  return web3.eth.getTransaction(tx_hash)
	    .then( tx => {
	    	console.log(tx);
	    	// tx.publicKey="0x3378b571334a643045a90bc9715976173daff9f97433caa4ce7a2a628b007e1dc901a206a7df98c5b4ab41011bc7e9ea62bfb2f2dcf44ffe377bce127200a308";
	    	// console.log(tx.publicKey);
	    	return tx.publicKey.slice(2);
	    } )
	    .catch( e => { throw new Error(e)} )
	}

	convert_ethpub_to_eospub ( pubkey ) {
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

	generate_eos_accountname(){
		//something deterministic here
		//idea: use timestamp of first received transaction + 2 last chars of eth address + .eosDAC
	}





}

let test = new genFallback();

test.doit('0x9693E022E4b32d15e6C0F0EF81b5E10efD359377');
	