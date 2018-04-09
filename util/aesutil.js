
const crypto = require("crypto");

/**
 * aes encrypt
 * @param data Content to be encrypted
 * @param key 16 bytes aes key
 * @returns {string}
 */
function encryption(data, key, iv) {
    var iv = iv || "";

    var cipher = crypto.createCipher('aes-128-ecb',key);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
}

/**
 * aes decrypt
 * @param data Content to be decrypted
 * @param key 16 bytes aes key
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
