import { countOccurrences, isWord, splitWords, standardizeText } from './caviarding';

describe("caviarding", () => {
  test("splitWords should support hebrew single quote", () => {
    expect(splitWords("ג'ירף")).toEqual(["ג'ירף"]);
  })

  test("isWord should support hebrew single quote", () => {
    expect(isWord("ג'ירף")).toBeTruthy();
  })

  test("countOccurrences should support hebrew single quote", () => {
    const text =  "בדיקה ג'ירף חתול ג'ירף גירף וג'ירף";
    const standardizedText = standardizeText(text);
    expect(countOccurrences(text, standardizedText, "ג'ירף", false)).toEqual(2)
    expect(countOccurrences(text, standardizedText, "ג'ירף", true)).toEqual(3)
  })

  test("splitWords should support hebrew words", () => {
    expect(splitWords(`נמר הכסף`)).toEqual(["נמר", " ", "הכסף"]);
  })

  test("splitWords should support hebrew double quote", () => {
    expect(splitWords(`"נמר הכסף"`)).toEqual([`"`, "נמר", " ", "הכסף", `"`]);
    expect(splitWords(`"באמצע "שלום" מילה".`)).toEqual([`"`, "באמצע", ` `, `"`, `שלום`,  `"`, ` `, `מילה`, `"`, "."]);
    expect(splitWords(`"באמצע ה"דקר" מילה".`)).toEqual([`"`, "באמצע", ` `, `ה`, `"`, `דקר`,  `"`, ` `, `מילה`, `"`, "."]);
    expect(splitWords(`ב"ביצה הלבנונית"`)).toEqual(["ב", `"`, "ביצה", ` `, `הלבנונית`, `"`]);
    expect(splitWords(`ה"ביצה הלבנונית"`)).toEqual(["ה", `"`, "ביצה", ` `, `הלבנונית`, `"`]);
    expect(splitWords(`ה"ידוע" ל"לא ידוע"`)).toEqual(["ה", `"`, "ידוע", `"`, ` `, 'ל', `"`, "לא", " ", "ידוע", `"`]);
  })

  test("splitWords should support hebrew double quote initials", () => {
    expect(splitWords(`חז"ל`)).toEqual([`חז"ל`]);
    expect(splitWords(`צה"ל`)).toEqual([`צה"ל`]);
    expect(splitWords(`"מ"מ"`)).toEqual([`"`,  `מ"מ`, `"`]);
    expect(splitWords(`"באמצע מ"מ מילה".`)).toEqual([`"`, "באמצע", ` `, `מ"מ`,  ` `, `מילה`, `"`, "."]);
  })
});