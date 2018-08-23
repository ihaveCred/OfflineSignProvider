
const Web3 = require("web3");
const kms = require("./kms");

/**
 * 
 * @param {any} baseProvider Web3 HTTPProvider
 * @param {{address:String,encodedKey:String}[]} privateKeyArray  
 * @param {any} kmsConfig KMS CONFIG
 */
function AwsKmsSignProvider(baseProvider, privateKeyArray, kmsConfig) {

    var web3 = new Web3(baseProvider);
    let hookedSend = baseProvider.send;
    let whiteList = new Set();
    for (var key of privateKeyArray) {
        whiteList.add(key.address.toLowerCase());
    }
    let pkMap = {};

    async function hook(payload, callback) {
        switch (payload.method) {
            case "eth_sendTransaction":
                if (payload.params && payload.params.length === 1 && whiteList.has(payload.params[0].from.toLowerCase())) {
                    let encodedKey = privateKeyArray.filter(kv => kv.address.toLowerCase() === payload.params[0].from.toLowerCase())[0].encodedKey;
                    let pk = pkMap[encodedKey];
                    if (!pk) {
                        pk = await kms.decrypt(encodedKey, kmsConfig);
                        pkMap[encodedKey] = pk;
                    }
                    payload.method = "eth_sendRawTransaction";
                    let tx = payload.params[0];
                    let signedTx = await web3.eth.accounts.signTransaction(tx, pk);
                    payload.params = [signedTx.rawTransaction];
                }
                break;
            default:
        }
        hookedSend.apply(baseProvider, [payload, callback]);
    }
    baseProvider.send = hook;
    return baseProvider;
}

module.exports = AwsKmsSignProvider;
