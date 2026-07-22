import { styleTags, tags as t } from "@lezer/highlight";

export const filterHighlighting = styleTags({
  DATE: t.keyword,
  "AND OR NOT": t.logicOperator,
  "Year Quarter Week Month Day": t.variableName,
  "Number Integer": t.number,
  "MINUS PLUS SLASH ASTERISK": t.operator,
  "LPAREN RPAREN": t.paren,
  Key: t.propertyName,
  Regex: t.regexp,
  String: t.string,
  Comment: t.lineComment,
  Tag: t.tagName,
  Link: t.link,
  Bool: t.atom,
  AccountName: t.labelName,
});

export default filterHighlighting;
