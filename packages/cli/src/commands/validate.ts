import { loadValidatedPolicy } from "./policyCompiler.js";
export function validateCommand(inputFile: string): void {
  try {
    const policy = loadValidatedPolicy(inputFile);
    console.log(`✓ Política válida: ${policy.profiles.length} perfis, ${policy.routes.length} rotas.`);
  } catch (error) {
    console.error(`✗ Política inválida: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
