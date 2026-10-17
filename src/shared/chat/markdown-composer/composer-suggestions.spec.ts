import { describe, it, expect } from "vitest";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import {
  composerTriggerQuery,
  suggestionQuery,
} from "./composer-suggestions.js";
describe("composer trigger boundaries", () => {
  it("retains UTF-16 positions and supplied query", () => {
    expect(suggestionQuery("👩🏽‍💻 (@Alex", ["@"])).toEqual({
      character: "@",
      query: "Alex",
      from: 9,
    });
  });
  it("recognizes slash, emoji and empty queries", () => {
    for (const character of ["/", ":", "#", "@"])
      expect(suggestionQuery(character, [character])).toEqual({
        character,
        query: "",
        from: 0,
      });
  });
  it("does not match email addresses, escaped triggers or preceding words", () => {
    for (const text of ["a@b.com", "\\@Alex", "word/summary", "@Alex "])
      expect(suggestionQuery(text, ["@", "/"])).toBeUndefined();
  });
});

describe("composer completion ownership", () => {
  function state(doc: string, position = doc.length) {
    return EditorState.create({
      doc,
      extensions: [markdown()],
      selection: { anchor: position },
    });
  }
  it("does not claim ordinary text or unregistered triggers", () => {
    expect(composerTriggerQuery(state("Kept draft"), ["@"])).toBeUndefined();
  });
  it("returns absolute UTF-16 offsets for configured trigger queries", () => {
    expect(composerTriggerQuery(state("before\n@Alex"), ["@"])).toEqual({
      character: "@",
      query: "Alex",
      from: 7,
    });
    expect(composerTriggerQuery(state("@Alex"), [])).toBeUndefined();
  });
  it("leaves Enter to code editing inside inline and fenced code", () => {
    expect(composerTriggerQuery(state("x `@a`", 5), ["@"])).toBeUndefined();
    expect(
      composerTriggerQuery(state("```\n@a\n```", 6), ["@"]),
    ).toBeUndefined();
  });
});
