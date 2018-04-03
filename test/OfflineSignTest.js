var OfflineSignProvider = require('../index');
const config = require('../config');
var Web3 = require('web3');
var nodeUrl = 'https://kovan.infura.io/FNKpcXdW3Dgou3VgYI7d';

var web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

var abi = require("./contract.json");
var TruffleContract = require("truffle-contract");

// var signUrl = 'http://127.0.0.1:3000/risk/offlinesign/signservice';
var signUrl = 'http://192.168.6.22:8080/api/pearl/v1/eth/sign_transaction';

var providerNew = new OfflineSignProvider(nodeUrl, signUrl, ['0xd7358e66c2ec3e398b39567b0c9f53a8e8c6000f'], config.aesKey);



var contractAddress = "0xafc60ddf39e7a953c4d341f2f4a80accf3432b76";
var myContract = TruffleContract({ abi: abi });
myContract.setProvider(providerNew);
myContract.defaults({ from: "0xd7358e66c2ec3e398b39567b0c9f53a8e8c6000f" });
var web3 = new Web3(providerNew);

var instance;
function init() {
    return new Promise((resolve, reject) => {
        if (instance) {
            resolve();
        } else {
            myContract.at(contractAddress).then(function (it) {
                instance = it;
                resolve();
            }).catch(e => {
                reject(e);
            });
        }
    });

}

async function submitTransaction() {
    await init();

    var data = {
        gas: '3100000',
        gasPrice: '90',
        value:'0'
    }
    var transactionResult = await instance.submitTransaction("0xa9e045eef5d8289872ab3b79b5ac58cbc40db6ff", web3.toWei('0.029', 'ether'), "", data).catch(console.log);

    console.log("transactionResult: " + transactionResult)

}

submitTransaction();









