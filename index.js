'use strict';

const ProviderEngine = require("web3-provider-engine");
const Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
const HookedSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js');

const url = require('url');
const Web3 = require("web3");
const ethUtil = require('ethereumjs-util');
const aesutil = require("./util/aesutil");
const config = require('./config');

function OfflineSignProvider(provider_url, sign_service_url, accounts, aesKey, enableZeroEx) {

    let http = sign_service_url.startsWith("https") ? require("https") : require("http");
    var urlData = url.parse(sign_service_url);
    this.engine = new ProviderEngine();
    var web3 = new Web3(this.engine);

    let hook = {
        getAccounts: function (cb) {
            cb(null, accounts);
        },
        signTransaction: function (txParams, cb) {
            var options = {
                hostname: urlData.hostname,
                port: urlData.port,
                path: urlData.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Timestamp": new Date().getTime(),
                    "Version": "1.0"
                }
            };
            var req = http.request(options, function (res) {
                if (res.statusCode !== 200) {
                    cb("invalid response");
                    return;
                }
                res.setEncoding('utf8');
                let result = "";
                res.on('data', function (body) {
                    result += body;
                });
                res.on("end", () => {
                    //TODO解析
                    var resultJson = JSON.parse(result);


                    var rsvJsonStr = aesutil.decryption(resultJson.data.signedTransaction, config.aesKey);
                    console.log("解密后的数据Str: ");
                    console.log(JSON.stringify(rsvJsonStr));

                    var rsvJsonData = JSON.parse(rsvJsonStr);
                    var signedData = rsvJsonData.r + rsvJsonData.s + rsvJsonData.v
                    console.log("组合后的签名数据:");
                    console.log(signedData);

                    if (!signedData.startsWith('0x')){
                        cb('0x' + signedData);
                    }else {
                        cb(signedData);//返回
                    }

                });
                res.on('error', function () {
                    cb("response error");
                });
            });


            let enc = aesutil.encryption(JSON.stringify(txParams), aesKey);
            let txObj = { address: txParams.from, transaction: enc };
            req.write(JSON.stringify(txObj));
            req.on('error', function (e) {
                console.log(e)
                cb("create request error");
            });
            req.end();
        }
    };

    if (enableZeroEx) {
        let signUrlData = url.parse(sign_service_url);
        hook.signMessage = function (message, cb) {

            console.log(message);
            const dataIfExists = message.data;
            if (!dataIfExists) {
                cb('No data to sign');
            }
            if (accounts.indexOf(message.from) === -1) {
                cb('Account not found');
            }

            var dataBuff = ethUtil.toBuffer(dataIfExists);
            var msgHashBuff = ethUtil.hashPersonalMessage(dataBuff);

            let options = {
                hostname: signUrlData.hostname,
                path: signUrlData.path,
                port: signUrlData.port,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Timestamp": new Date().getTime(),
                    "Version": "1.0"
                }
            };
            var req = http.request(options, function (res) {
                if (res.statusCode !== 200) {
                    cb("invalid response");
                    return;
                }
                res.setEncoding('utf8');
                let result = "";
                res.on('data', function (body) {
                    result += body;
                });
                res.on("end", () => {
                    var resultJson = JSON.parse(result);

                    var rsvJsonStr = aesutil.decryption(resultJson.data.signedTransaction, config.aesKey);
                    console.log("解密后的数据Str: ");
                    console.log(JSON.stringify(rsvJsonStr));

                    var rsvJsonData = JSON.parse(rsvJsonStr);
                    var signedData = rsvJsonData.r + rsvJsonData.s + rsvJsonData.v
                    console.log("组合后的签名数据:");
                    console.log(signedData);

                    if (!signedData.startsWith('0x')){
                        cb('0x' + signedData);
                    }else {
                        cb(signedData);//返回
                    }
                });
                res.on('error', function () {
                    cb("response error");
                });
            });
            req.write(JSON.stringify(txParams));
            req.on('error', function () {
                cb("create request error");
            });
            req.end();
        }
    }

    this.engine.addProvider(new HookedSubprovider(hook));

    this.engine.addProvider(new FiltersSubprovider());

    this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));


    // network connectivity error
    this.engine.on('error', function(err){
        // report connectivity errors
        console.error(err.stack)
    })

    this.engine.start();
};

OfflineSignProvider.prototype.sendAsync = function () {
    console.log("sendAsync");
    console.log(arguments);
    this.engine.sendAsync.apply(this.engine, arguments);
};

OfflineSignProvider.prototype.send = function () {
    console.log("send");
    console.log(arguments);
    return this.engine.send.apply(this.engine, arguments);
};

// returns the address of the given address_index, first checking the cache
OfflineSignProvider.prototype.getAddress = function (idx) {
    console.log("getAddress");
    console.log(arguments);
    console.log('getting addresses', this.addresses[0], idx)
    if (!idx) { return this.addresses[0]; }
    else { return this.addresses[idx]; }
}

// returns the addresses cache
OfflineSignProvider.prototype.getAddresses = function () {
    return this.addresses;
}

module.exports = OfflineSignProvider; 
