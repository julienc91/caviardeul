import { countOccurrences, isWord, splitWords, standardizeText } from './caviarding';

describe("caviarding", () => {
  test("splitWords should support hebrew single quote", () => {
    expect(splitWords("ג'ירף")).toMatchObject(["ג'ירף"]);
  })

  test("isWord should support hebrew single quote", () => {
    expect(isWord("ג'ירף")).toBeTruthy();
  })

  test("countOccurrences should support hebrew single quote", () => {
    const text =  "בדיקה ג'ירף חתול ג'ירף גירף";
    const standardizedText = standardizeText(text);
    expect(countOccurrences(text, standardizedText, "ג'ירף", false)).toMatchObject({ count: 2 })
  })

  test("splitWords should support hebrew double quote", () => {
    expect(splitWords(`חז"ל`)).toMatchObject([`חז"ל`]);
  })
});