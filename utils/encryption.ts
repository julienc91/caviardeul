import AES from "crypto-js/aes";
import enc from "crypto-js/enc-utf8";

/*
Encryption is used to send the article to the client, to not
make cheating too easy.
*/

/**
 * Decrypt a string using AES.
 * @param encoded
 * @param key
 */
export const decode = (encoded: string, key: string): string => {
  return AES.decrypt(encoded, key).toString(enc);
};

/**
 * Encrypt a string with AES.
 * @param decoded
 * @param key
 */
export const encode = (decoded: string, key: string): string => {
  return AES.encrypt(decoded, key).toString();
};
