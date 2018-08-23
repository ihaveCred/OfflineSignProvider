var AWS = require('aws-sdk');

let KMS = AWS.KMS;

 

/**
 * encrypt private key
 * @param {String} pk eth privateKey
 * @param {String} keyId AWS KMS key id
 * @param {any} kmsConfig AWS KMS config
 */
async function encrypt(pk, keyId, kmsConfig) {
    let kms = new KMS(kmsConfig);
    return new Promise((resolve, reject) => {
        kms.encrypt({
            KeyId: keyId,
            Plaintext: pk
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    var hex = (data.CiphertextBlob).toString('hex');
                    resolve(hex);
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
}

/**
 * decrypt private key
 * @param {String} encodedKey encoded private key
 * @param {any} kmsConfig AWS KMS config
 */
async function decrypt(encodedKey, kmsConfig) {
    let kms = new KMS(kmsConfig);
    return new Promise((resolve, reject) => {
        kms.decrypt({
            CiphertextBlob: new Buffer(encodedKey, 'hex')
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Plaintext.toString());
            }
        });
    });
};

module.exports = { encrypt, decrypt };


(async () => {

    function printUsage() {
        console.log("encrypt usage:");
        console.log("npm encrypt {accessKeyId} {region} {secretAccessKey} {keyId} {privateKey}");
        console.log("decrypt usage:");
        console.log("npm decrypt {accessKeyId} {region} {secretAccessKey} {encodedPrivateKey}");
    }

    if (process.argv[2] === "encrypt") {
        let accessKeyId = process.argv[3];
        let region = process.argv[4];
        let secretAccessKey = process.argv[5];
        let keyId = process.argv[6];
        let pk = process.argv[7];
        if (accessKeyId && region && secretAccessKey && keyId && pk) {
            try {
                let kmsCfg = {
                    accessKeyId,
                    region,
                    secretAccessKey
                };
                console.log("encrypting CONFIG:" + JSON.stringify({
                    accessKeyId,
                    region,
                    secretAccessKey,
                    keyId
                }));

                let encodedKey = await encrypt(pk, keyId, kmsCfg);
                console.log("encrypt success,verifying....");
                if (pk === await decrypt(encodedKey, kmsCfg)) {
                    console.log("verify success, encrypt result:");
                    console.log(encodedKey);
                } else {
                    console.error("verify fail！！！！！");
                }
            } catch (e) {
                console.error(e);
                console.log("FAIL!!");
                printUsage();
            }
        } else {
            printUsage();
        }
    } else if (process.argv[2] === "decrypt") {
        let accessKeyId = process.argv[3];
        let region = process.argv[4];
        let secretAccessKey = process.argv[5];
        let encodedPrivateKey = process.argv[6];
        if (accessKeyId && region && secretAccessKey && encodedPrivateKey) {
            try {
                let kmsCfg = {
                    accessKeyId,
                    region,
                    secretAccessKey
                };
                console.log("decrypting CONFIG:" + JSON.stringify({
                    accessKeyId,
                    region,
                    secretAccessKey
                }));
                console.log("decrypt result:" + await decrypt(encodedPrivateKey, kmsCfg));



            } catch (e) {
                console.error(e);
                console.log("FAIL!!");
                printUsage();
            }
        } else {
            printUsage();
        }
    }
})();