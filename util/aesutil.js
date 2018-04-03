
const crypto = require("crypto");

/**
 * aes加密
 * @param data 待加密内容
 * @param key 必须为32位私钥
 * @returns {string}
 */
function encryption(data, key, iv) {
    var iv = iv || "";

    var cipher = crypto.createCipher('aes-128-ecb',key);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
}

/**
 * aes解密
 * @param data 待解密内容
 * @param key 必须为32位私钥
 * @returns {string}
 */
function decryption(data, key, iv) {
    if (!data) {
        return "";
    }
    var decipher = crypto.createDecipher('aes-128-ecb', key)
    var dec = decipher.update(data, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports.decryption = decryption;
module.exports.encryption = encryption;
