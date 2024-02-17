import AES from "crypto-js/aes";
import enc from "crypto-js/enc-utf8";

import { Article, EncodedArticle } from "@caviardeul/types";

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

/**
 * Convert a Base64Url string to Base64.
 * @param str
 */
export const fromBase64Url = (str: string): string => {
  return str.replace(/-/g, "+").replace(/_/g, "/");
};

/**
 * Generate a random key.
 */
export const generateKey = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Decrypt an EncodedArticle object.
 */
export const decodeArticle = (encodedArticle: EncodedArticle): Article => {
  const { key, articleId, safety, archive, custom, pageName, content } =
    encodedArticle;
  return {
    articleId,
    safety,
    archive,
    custom,
    pageName: decode(pageName, key),
    content: decode(content, key),
  };
};
