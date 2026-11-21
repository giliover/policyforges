import fs from "fs";
import path from "path";

/** The same directory layout works in src/ (development) and dist/ (npm). */
const templateDirectory = path.resolve(__dirname, "../../templates");

export function readTemplate(...segments: string[]): string {
  const filename = path.resolve(templateDirectory, ...segments);
  if (!filename.startsWith(templateDirectory + path.sep)) {
    throw new Error("Invalid template path");
  }
  return fs.readFileSync(filename, "utf8");
}

/** Explicit, single-use marker replacement; fails if a template is changed accidentally. */
export function replaceMarkedLine(source: string, marker: string, replacement: string): string {
  const lines = source.split("\n");
  const hits = lines.reduce<number[]>((found, line, index) => {
    if (line.includes(marker)) found.push(index);
    return found;
  }, []);
  if (hits.length !== 1) throw new Error(`Expected exactly one template marker: ${marker}`);
  lines[hits[0]] = replacement;
  return lines.join("\n");
}

/** Read a line of source in its original language, excluding the marker comment. */
export function markedLine(source: string, marker: string): string {
  const lines = source.split("\n").filter((line) => line.includes(marker));
  if (lines.length !== 1) throw new Error(`Expected exactly one template marker: ${marker}`);
  return lines[0].replace(/\s*(?:\/\/|\{\/\*)\s*@policyforges:[\w-]+\s*(?:\*\/\})?\s*$/, "");
}
