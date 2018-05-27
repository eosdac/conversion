# Interacting with the smart contract
you can interact with the smart contract through MEW, Remix etc or with the static html page in the www folder (metamask required).
currently there is a basic contract deployed on the ropsten test net.

# interact with smart contract via Dapp frontend
cd to www and start webserver.

```
cd ./www
python -m SimpleHTTPServer
```
visit index.html with an ethereum enabled browser (ie. metamask)

# build instructions
inside this folder
```
npm install
browserify index.js -o ./www/js/bundle.js
```


