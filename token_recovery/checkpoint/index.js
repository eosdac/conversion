"use strict";
const Web3 = require('web3');
window.$ = window.jQuery = require('jquery'); //I know, shouldn't use jquery but I'm used to it :-/





class eosDACCheckPoint {
  constructor() {

    this._setConnProvider("https://mainnet.infura.io/3pwc8IbEcX85hRFzSVoi", "HttpProvider"); //default = HttpProvider [WebsocketProvider,IpcProvider]
    this.contracts = {};
    this._initContracts();

    //easy DOM access
    this.DOM = {};
    this.DOM.result = $('#result');
	this.DOM.eosdac_bal =$("#eosdac_bal");
	this.DOM.eos_bal =$("#eos_bal");
	this.DOM.eos_pub_key =$("#eos_pub_key");
	this.DOM.is_loading = $("#is_loading");



  }

  checkEthAddress(addr){
  	this.DOM.result.hide();
  	this.DOM.is_loading.fadeIn('fast');
  	var self = this;
  	let prom = [];
  	prom.push(this.getEosKeyFromAddress(addr) );
  	prom.push(this.getBalanceOf(addr, 'eosDAC') );
  	prom.push(this.getBalanceOf(addr, 'eosToken') );

	Promise.all(prom)
	.then(function(res) {
	  console.log(res);
	  setTimeout(function(){ self._updateDom(res); }, 400);
	  
	})
	.catch(function(err) {
	  console.log(err.message); // some coding error in handling happened
	});

  }

  getEosKeyFromAddress(addr){
  	return this.contracts.eosCrowdSale.methods.keys(addr).call().then(function (p) {
      // console.log(p);
      return p?p:0;
      
    })
    .catch(console.error);
  }
  

  getBalanceOf(addr, contr){
  	var self = this;
	return this.contracts[contr].methods.balanceOf(addr).call().then(function (result) {	  		
	  		let amount = (result/Math.pow(10, 18)).toFixed(4);

	        return amount;
	}).catch(function(e){
    		console.log(e);
	
		});
  }
  

  _updateDom(arr){
  	this.DOM.is_loading.hide();

  	if(arr[0]){
  		this.DOM.eos_pub_key.html('Your EOS public key is <span class="success">'+arr[0]+'</span>').removeClass('error')
  	}
  	else{
  		this.DOM.eos_pub_key.html('Your address is not registered!').addClass('error');
  	}

  	this.DOM.eosdac_bal.html(arr[1]+' <span>eosDAC</span>');
  	this.DOM.eos_bal.html(arr[2]+' <span>EOS</span>');
  	this.DOM.result.fadeIn();
 }


  _initContracts(){
  	const contrs = require('./contracts.config.json');
  	this.contracts.eosDAC = new this.web3.eth.Contract(contrs.eosDAC.abi, contrs.eosDAC.contractAddress);
  	this.contracts.eosCrowdSale = new this.web3.eth.Contract(contrs.eosCrowdSale.abi, contrs.eosCrowdSale.contractAddress);
  	this.contracts.eosToken = new this.web3.eth.Contract(contrs.eosToken.abi, contrs.eosToken.contractAddress);

  }
  _setConnProvider(url, type = 'HttpProvider'){

	this.web3 = new Web3(new Web3.providers[type](url));  //http://localhost:8545
	// console.log(this.web3.providers);
  }

}//end class



$(function() {

	const checkPoint = new eosDACCheckPoint();

	$('#send').on('click', function(){
		let addr = $('#eth_address').val();
		checkPoint.checkEthAddress(addr);


	});
	




});



// checkPoint.scan();

