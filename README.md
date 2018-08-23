# offlineSignProvider
This is a customized Ethereum web3-provider to facilitate separation of business layer and wallet layer

encrypt\decrpty command line usage

```
npm encrypt {accessKeyId} {region} {secretAccessKey} {keyId} {privateKey}
npm decrypt {accessKeyId} {region} {secretAccessKey} {encodedPrivateKey}
```


provider usage
```
let Web3 = require('web3');
const Provider = require("offlinesignprovider");
var baseProvider = new Web3.providers.HttpProvider("https://kovan.infura.io/xxxxxxx");
var web3 = new Web3(new Provider(baseProvider, [{ address: "0x000000000", encodedKey: "aaaabbbccceedd" }], {
    accessKeyId,     //KMS accessKeyId
    region,          //KMS region
    secretAccessKey  //KMS secretAccessKey
}));

web3.eth.sendTransaction(tx);// send tx
```