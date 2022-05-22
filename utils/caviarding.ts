export const commonWords = new Set<string>([
  "a",
  "à",
  "ainsi",
  "alors",
  "après",
  "autour",
  "avant",
  "avec",
  "au",
  "aux",
  "ça",
  "car",
  "ce",
  "ces",
  "comme",
  "contre",
  "d",
  "dans",
  "de",
  "depuis",
  "des",
  "donc",
  "du",
  "en",
  "entre",
  "est",
  "et",
  "jusqu",
  "l",
  "la",
  "le",
  "les",
  "mais",
  "n",
  "ne",
  "non",
  "ou",
  "où",
  "par",
  "pas",
  "pendant",
  "pour",
  "qu",
  "que",
  "qui",
  "s",
  "se",
  "si",
  "sur",
  "un",
  "une",
  "vers",
  "y",
]);

export const splitWords = (text: string): string[] => {
  return text.split(/([^\da-zà-ùœ]+)/i);
};

export const isWord = (word: string): boolean => {
  return !!word.match(/^[\da-zà-ùœ]+$/i);
};

export const countOccurrences = (text: string, word: string): number => {
  const regex = new RegExp(
    `\([^\\da-zà-ùœ]|^)(${word.toLocaleLowerCase()})([^\\da-zà-ùœ]|$)`,
    "gim"
  );
  const matches = Array.from(text.matchAll(regex));
  return matches.length;
};
