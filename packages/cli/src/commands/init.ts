import fs from "fs";
import path from "path";
import { CodeGenerator } from "../generator/index.js";
import { scaffoldRouteModule } from "../generator/moduleScaffold.js";
import { routeModuleName } from "../generator/routeModuleName.js";
import { readTemplate } from "../generator/templateReader.js";
import { loadValidatedPolicy } from "./policyCompiler.js";


function createIfMissing(file: string, content: string): boolean {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // wx prevents replacing user code if another process creates the file.
  try {
    fs.writeFileSync(file, content, { encoding: "utf8", flag: "wx" });
    return true;
  } catch (error: any) {
    if (error.code === "EEXIST") return false;
    throw error;
  }
}

/** Idempotent project scaffold. `compile` remains the explicit regeneration step. */
export function initCommand(filename: string = "security.auth", outputDir: string = "src/routes-rbac") {
  const targetPath = path.resolve(process.cwd(), filename);
  const routesDir = path.resolve(process.cwd(), outputDir);
  const modulesDir = path.resolve(process.cwd(), "src/modules");

  try {
    const dslCreated = createIfMissing(targetPath, readTemplate("security.auth"));
    console.log(dslCreated ? `✅ Criado: ${filename}` : `ℹ️ Mantido: ${filename} (já existe)`);

    // Always use the actual DSL, including when the user has customized it.
    const ast = loadValidatedPolicy(targetPath);
    const modulesImport = path.relative(routesDir, modulesDir).split(path.sep).join("/");
    const relativeModulesImport = modulesImport.startsWith(".") ? modulesImport : `./${modulesImport}`;
    const generator = new CodeGenerator(ast, relativeModulesImport);
    const { authTypesCode, appRoutesCode } = generator.generate();

    const files: [string, string][] = [
      [path.join(routesDir, "authTypes.ts"), authTypesCode],
      [path.join(routesDir, "AppRoutes.tsx"), appRoutesCode],
    ];

    const firstProtectedPath = ast.routes.find((route) => !route.isPublic)?.path;
    for (const route of ast.routes) {
      files.push([
        path.join(modulesDir, `${routeModuleName(route.path)}.tsx`),
        scaffoldRouteModule(route, firstProtectedPath),
      ]);
    }

    for (const [file, code] of files) {
      const relative = path.relative(process.cwd(), file);
      console.log(createIfMissing(file, code) ? `✅ Criado: ${relative}` : `ℹ️ Mantido: ${relative} (já existe)`);
    }
    console.log("✨ Projeto preparado. Edite os módulos e execute 'policyforges validate'.");
  } catch (error: any) {
    console.error(`❌ Falha no init: ${error.message}`);
    process.exitCode = 1;
  }
}
