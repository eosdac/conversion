This is the default place for files which get generated from the tools and which will be used for the crossover.

The main file will contain all of the eosdac accounts, their eosdac balance to move across, their associated EOS chain public key and account name (if known)

eosdac_genesis_distribution.csv contains the erc20 distribution with the e05dac burn address removed and the missed exchange accounts included as per https://steemit.com/eos/@eosdac/statement-on-inclusion-of-specific-exchange-wallets-in-the-eosdac-token-transition-to-the-eos-chain - This has been ordered by eosdac token amount and accounts with balances less than 0.0001 tokens removed.

eosdac_genesis_master.csv is the key file that contains ethereum addresses, eos keys, eosdac token balance, eos token balance and eos account name. Fallback details will be published later.

Main statistics on the genesis master

> Total accounts with >0.0001 eosDAC tokens = 93 203 
> Total tokens that will be in the eosDAC genesis contract = 994 902 344.3573
> Total tokens in accounts that have eos keys and contain at least 1 EOS = 887 272 169.2941 (89.18%)
> Total tokens in accounts that have eos keys and contain less than 1 EOS	= 43 580 355.8945 (4.38%)
> Amount of EOS held by eosDAC token holders = 447 685 396.0276 (less than half they held on April 15th)
> Number of accounts with almost exactly the same amount of EOS as eosDAC = 40 829 
> EOS/eosDAC held by these accounts = 129 602 257.1049



