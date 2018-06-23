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


Pre drop update (23rd June): 

1) The total amount of eosDAC was verreported by 7089 tokens - total supply is now  994895254.9762
2) Three exchanges requested amalgation of accounts. This affects the following

gate.io	
  0x1C4b70a3968436B9A0a9cf5205c787eb81Bb558c	27312105.2154	EOS6gkXx8HYtTjfL4kdY74w4RTapUZZQ9JDUzqsQ4gWYn3zKN5D8X				
	0x0D0707963952f2fBA59dD06f2b425ace40b492Fe	3053305.7841					
	0x05ee546c1a62f90d7acbffd6d846c9c54c7cf94c	17013785.5700					
	0xb7715cb185990a1d7fede7bb5a3c369296018279	496196.0854					
	total	47875392.6549		
							
AEX	
  0xf3e36ad56aa85abdacc18c02d19509ae4f7d5899	185038.7062	EOS6yCLipm1X8ztvkG1Nmntv33Yve2sHGeJQfqLmd55HrLBNXNBo6				
	0x8193c2b585f3de9f0b54179351d3e31ad18377e8	719731.1					
	total	904769.8062				
							
Bitbns	
  0xc48a185515a6e09427ed6738519a022400d4e26d	8106.85	Change to EOS4wkRuWztSSH3nyP3ZcEcaJ9UBdL7BzNwXgR4vjZWuQRuGAVQsJ (bitbns global account)				
	0xe49749bfea87f6b962a53f5b77d5bd8a71babb4f	334.425					
	0x52fe8552e0c4e3b282cf29dd8ca1246174f64fbd	163.0581					
	0xe853bee70ed064ade7feab738130b308004bec40	717.57					
	0x9dbb25605beb8ce7ca19dddef7fcd1e7abba1c69	417.01					
	0x985d7d094ec00e5dd3967326cc3cfc6fd07fbad1	16.6					
	total	9755.5131	will be sent to the bitbnsglobal account
  
3) Contract addresses will not be dropped to. In due course eosDAC plans to work with token holders who had balances in exchanges such as forkdelta and iDEX to identify a way of getting proof of balance - This does not represent a guarentee that balances can be carried over from these exchanges, just that eosDAC will try to assist to a reasonable degree.

4) EOSDAC tokens will be not be transferable until audits have been carried out on the integrity of the drop.
