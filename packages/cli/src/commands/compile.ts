import fs from "fs";
import path from "path";
import { loadValidatedPolicy } from "./policyCompiler.js";


import { CodeGenerator } from "../generator/index.js";

export function compileCommand(inputFile: string, outputDir: string) {
  const inputPath = path.resolve(process.cwd(), inputFile);
  const targetDir = path.resolve(process.cwd(), outputDir);

  if (!fs.existsSync(inputPath)) {
    console.error(
      `❌ Erro: Arquivo de DSL '${inputFile}' não foi encontrado em ${inputPath}`,
    );
    process.exit(1);
  }

  try {
    console.log(`🔍 Lendo DSL de autenticação: ${inputFile}...`);
    const policyAst = loadValidatedPolicy(inputFile);

    // 4. Geração de Código
    const generator = new CodeGenerator(policyAst);
    const { authTypesCode, appRoutesCode } = generator.generate();

    // 5. Gravação no disco
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const typesPath = path.join(targetDir, "authTypes.ts");
    const routesPath = path.join(targetDir, "AppRoutes.tsx");

    fs.writeFileSync(typesPath, authTypesCode, "utf-8");
    fs.writeFileSync(routesPath, appRoutesCode, "utf-8");

    console.log(`✅ Sucesso! Código React gerado em: ${outputDir}/`);
    console.log(`   - ${outputDir}/authTypes.ts`);
    console.log(`   - ${outputDir}/AppRoutes.tsx`);
  } catch (err: any) {
    console.error(`❌ Falha no processo de compilação: ${err.message}`);
    process.exit(1);
  }
}
