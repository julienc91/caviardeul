import fernet from "fernet";

import { Article, EncodedArticle } from "@caviardeul/types";

/*
Encryption is used to send the article to the client, to not
make cheating too easy.
*/

export const checkEncryptionKey = (key: string): boolean => {
  try {
    new fernet.Secret(key);
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * Decrypt a string using AES.
 * @param encoded
 * @param key
 */
export const decode = (encoded: string, key: string): string => {
  const secret = new fernet.Secret(key);
  const token = new fernet.Token({
    secret,
    token: encoded,
    ttl: 0,
  });
  return token.decode();
};

/**
 * Encrypt a string with AES.
 * @param decoded
 * @param key
 */
export const encode = (decoded: string, key: string): string => {
  const secret = new fernet.Secret(key);
  const token = new fernet.Token({
    secret,
    ttl: 0,
  });
  return token.encode(decoded);
};

/**
 * Generate a random key.
 */
export const generateKey = (): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return btoa(result);
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
