pragma solidity ^0.4.24;
//eosDAC Proof Of Ownership
//This contract does nothing but emiting Poosh events initiated by the sender
//The sender is able to proof his ownership of the address that holds eosDAC
//The contract also maps the senders address with the given EOS public key or account name.

contract eosDACPoosh {
   //this mapping is not really necessary but it makes it easy for the user and developper
   //to check the mapping. You can get the same data from the events though. keeping this mapping
   //will result in a slightly higher gas price so it's a trade-off.
   
   mapping (address => string) public seeMyKey;
   
   event Poosh(
       string eospub,
       address sender
    );

   function rescueEosDacTokens(string eosp) public {
       //should we allow tokens to be rescued for ever?
       
       assert(bytes(eosp).length <= 64);
       seeMyKey[msg.sender] = eosp;
       emit Poosh(eosp, msg.sender);
   }
 
}