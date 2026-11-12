// AI-assisted (Claude Code): tests for the ISCED-F field list and the profile study-field rules.
/// <reference types="jest" />
import { fieldCodes, fieldName, fieldSearchText, isFieldCode, readFieldCodes, readStudies, studiesText } from "./fields";

describe("ISCED-F fields", () => {
  it("lists detailed 4-digit codes only, without generic, inter-disciplinary or n.e.c. entries", () => {
    expect(fieldCodes.length).toBe(77);
    expect(fieldCodes.every((code) => /^\d{4}$/.test(code))).toBe(true);
    expect(fieldCodes.some((code) => code.startsWith("00") || code.endsWith("8") || code.endsWith("9"))).toBe(false);
  });

  it("names a field in English", () => {
    expect(fieldName("0413")).toBe("Management and administration");
  });

  it("finds every engineering field by the area name", () => {
    const engineering = fieldCodes.filter((code) => fieldSearchText(code).includes("engineering"));
    expect(engineering).toEqual(expect.arrayContaining(["0711", "0713", "0716", "0721", "0732"]));
  });
});

describe("profile study fields", () => {
  it("reads a code, free text and empty values", () => {
    expect(readStudies("0613")).toEqual({ code: "0613" });
    expect(readStudies(" Industrial Engineering ")).toEqual({ other: "Industrial Engineering" });
    expect(readStudies("")).toBeNull();
    expect(readStudies(null)).toBeNull();
  });

  it("treats a 4-digit value that is not in the list as free text", () => {
    expect(isFieldCode("0119")).toBe(false);
    expect(readStudies("0119")).toEqual({ other: "0119" });
  });

  it("shows the field name or the student's text", () => {
    expect(studiesText("0311")).toBe("Economics");
    expect(studiesText("Computer Engineering")).toBe("Computer Engineering");
    expect(studiesText(null)).toBeNull();
  });

  it("drops saved fields that are not codes", () => {
    expect(readFieldCodes(["Computer Engineering", "0413", "0542"])).toEqual(["0413", "0542"]);
  });
});
