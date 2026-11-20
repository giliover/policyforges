import fs from "fs";
import path from "path";
import { Lexer } from "../lexer/index.js";
import { Parser } from "../parser/index.js";
import { SemanticAnalyzer } from "../analyzer/index.js";

/** Single validation pipeline for every CLI command. */
export function loadValidatedPolicy(inputFile: string) {
  const absolutePath = path.resolve(process.cwd(), inputFile);
  const source = fs.readFileSync(absolutePath, "utf8");
  const tokens = new Lexer(source).tokenize();
  const policyAst = new Parser(tokens).parse();
  const issues = new SemanticAnalyzer(policyAst).analyze();
  if (issues.length) {
    throw new Error(issues.map((issue) => `Linha ${issue.line}: ${issue.message}`).join("\n"));
  }
  return policyAst;
}
