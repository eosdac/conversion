# conversion
Code for moving the ERC20 eosDAC tokens to an EOSIO blockchain
Everything in this folder is currently in development. But all tools should work.
Bugs or questions!? Please contact me. 

Use node v8.11.2 to build and run the tools.

#The plan
1. make eosDAC erc20 snapshot post freeze
2. combine genesis output with (1) so that we have [eth address, eos pub, #eos, #eosDAC] for every eosDAC holder minus unregistered wallets
3. rescue the eosDAC from unregistered wallets (post freeze) with the token recovery process

note: I'm pretty sure I can integrate (1) and (2) in the same snapshot tool. (TODO?)
note: currently we do not know how the genesis tool will handle unregistered wallets, however it really doesn't matter. 
