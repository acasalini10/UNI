// AI-assisted (Claude Code): tests for the ISCED-F field list and the profile study-field rules.
/// <reference types="jest" />
import { fieldCodes, fieldDetail, fieldName, fieldSearchText, isFieldCode, readFieldCodes, readStudies, studiesText } from "./fields";

describe("ISCED-F fields", () => {
  it("lists detailed 4-digit codes only, without generic, n.e.c. or inter-disciplinary entries except engineering (0788)", () => {
    expect(fieldCodes.length).toBe(78);
    expect(fieldCodes.every((code) => /^\d{4}$/.test(code))).toBe(true);
    expect(fieldCodes.filter((code) => code.startsWith("00") || code.endsWith("8") || code.endsWith("9"))).toEqual(["0788"]);
  });

  it("finds common degree names through the aliases, in English and Spanish", () => {
    const find = (query: string) => fieldCodes.filter((code) => fieldSearchText(code).includes(query));
    expect(find("industrial engineering")).toEqual(["0788"]);
    expect(find("ingenieria industrial")).toEqual(["0788"]);
    expect(find("computer science")).toEqual(["0613"]);
    expect(find("data science")).toEqual(["0542", "0613"].sort((a, b) => fieldCodes.indexOf(a) - fieldCodes.indexOf(b)));
  });

  it("shows the included degree names under an aliased field, the area otherwise", () => {
    expect(fieldDetail("0788")).toBe("Includes: Industrial engineering, Engineering management, Systems engineering");
    expect(fieldDetail("0313")).toBe("Social sciences, journalism and information");
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
