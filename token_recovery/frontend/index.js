const Eth = require('ethjs-query');
const EthContract = require('ethjs-contract');
window.$ = window.jQuery = require('jquery'); //I know, shouldn't use jquery but I'm used to it :-/
var app;


//this handles the detection of a web3 enabled browser ie. metamask + jquery DOM eventhandlers
//should make a reusable class for this
window.addEventListener('load', function() {
    
    if (typeof window.web3 !== 'undefined') {
      console.log('web3 detected');
      $('#metamask_not_detected').hide();
      $('#metamask_detected').fadeIn();
      app = new rescueEosDac();
    } 
    else{
        console.log('You don\'t have a web3 browser');
        $('#metamask_not_detected').fadeIn();
        $('#metamask_detected').hide();


    }

    //event handlers jquery
    $('#send').on('click', function(){
        //validate user input 
        let value = $('#eospub').val();
        value = value.trim();
        //TODO validate input
        if(value.length > 10){
          app.sendEosKey(value);
        }
        else{
          console.log('Please input a valid EOS accountname');
        }
    });

});//end load


class rescueEosDac {
  constructor() {
    var self = this;
    this._extend_Web3_Eth();//add method(s) to window.web3
    this.contractAddress = '0x1D9ef0F23e26f6a533aEf75558a11EeB91E59d66';
    this.abi = [ { "anonymous": false, "inputs": [ { "indexed": false, "name": "eospub", "type": "string" }, { "indexed": false, "name": "sender", "type": "address" } ], "name": "Poosh", "type": "event" }, { "constant": false, "inputs": [ { "name": "_eospub", "type": "string" } ], "name": "resqueEosDacTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "seeMyKey", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ];
    this.contract = this._initContract();
    this.account = window.web3.eth.accounts[0];
    this.etherscan_tx = "https://ropsten.etherscan.io/tx/";

    //easy DOM access TODO: DOM update function, it's now inline and difficult to maintain.
    this.DOM = {};
    this.DOM.ismining = $('#ismining');
    this.DOM.connection_status =$("#eth_connection_status");
    this.DOM.etherscan_link = $('#etherscan_tx');

    //TODO: this does not belong here
    if(this.account){
     //delay for nicer GUI
     setTimeout(function() {

         self.DOM.connection_status.removeClass('is_loading_text').html('You are connected with address: <b>'+self.account+'</b>').hide().fadeIn();
     }, 300);
      
    }

  }

  sendEosKey(eoskey){
    var self = this;
    //do transaction with data message "eoskey" (can be account name too) to connected node (remember our node is accessible through metamask or similar)
    this.contract.resqueEosDacTokens(eoskey, {
       gas: 300000,
       from: this.account,
       to : this.contractAddress
    }, (err, txid) => {
       if(err){return false;}

       self.DOM.ismining.fadeIn();

       let link = '<a href="'+self.etherscan_tx+txid+'">'+self.etherscan_tx+txid+'</a>'; //etherscan tx link
       self.DOM.etherscan_link.hide().html(link).fadeIn(); //update DOM
       console.log('txid: '+txid);

       //wait for transaction to be mined
       window.web3.eth.getTransactionReceiptMined(txid).then(function (receipt) {
            if(receipt.status == '0x1'){ //success
              // console.log(receipt);
              console.log('Your transaction is mined successfully.');
              self.DOM.ismining.html('Successfully registered on blockchain').addClass('success');
            }
            else{
              console.log('Your transaction had an error.');
              self.DOM.ismining.html('Error').addClass('error');

            }

        });

    });

  }

  checkEosKey(ethaccount){
    //read from mapping on smart contract: eth address -> eos address/account
    this.contract.seeMyKey(ethaccount)
    .then(function (p) {
      console.log(p);
    })
    .catch(console.error);
  }

  //TODO put in config json and add support for multiple contracts
  _initContract(){
    console.log('init contract');
    const eth = new Eth(window.web3.currentProvider);
    const contract = new EthContract(eth);
    const t = contract(this.abi).at(this.contractAddress);
    return t; //return to store in scope
  }

  _extend_Web3_Eth(){
      //http://blog.bradlucas.com/posts/2017-08-22-wait-for-an-ethereum-transaction-to-be-mined/
      window.web3.eth.getTransactionReceiptMined= function getTransactionReceiptMined(txHash, interval) {
          const self = this;
          const transactionReceiptAsync = function(resolve, reject) {
              self.getTransactionReceipt(txHash, (error, receipt) => {
                  if (error) {
                      reject(error);
                  } else if (receipt == null) {
                      setTimeout(
                          () => transactionReceiptAsync(resolve, reject),
                          interval ? interval : 500);
                  } else {
                      resolve(receipt);
                  }
              });
          };
          if (Array.isArray(txHash)) {
              return Promise.all(txHash.map(
                  oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
          } else if (typeof txHash === "string") {
              return new Promise(transactionReceiptAsync);
          } else {
              throw new Error("Invalid Type: " + txHash);
          }
      };
  }




}//end class
