// packages/cli/src/commands/secureBuild.ts
import fs from "fs";
import path from "path";
import { build, Plugin } from "esbuild";
import { loadValidatedPolicy } from "./policyCompiler.js";

import { ServerGenerator } from "../generator/serverGenerator.js";
import { ProgramNode } from "../parser/ast.js";
import { routeModuleName } from "../generator/routeModuleName.js";

export interface SecureBuildOptions {
  dslFile?: string;
  serverDir?: string;
}

const reactGlobalPlugin: Plugin = {
  name: "react-global",
  setup(build) {
    build.onResolve({ filter: /^react$/ }, (args) => ({
      path: args.path,
      namespace: "react-global",
    }));
    build.onLoad({ filter: /.*/, namespace: "react-global" }, () => ({
      contents: `
        const R = (typeof window !== 'undefined' && window.React) || {};
        export default new Proxy(R, { get: (target, prop) => target[prop] });
        export const {
          createElement, cloneElement, isValidElement, createContext,
          Fragment, StrictMode, Suspense, Profiler, Component, PureComponent,
          Children, createRef, useState, useEffect, useContext, useReducer,
          useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect,
          useDebugValue, useDeferredValue, useTransition, useId,
          useSyncExternalStore, useInsertionEffect, useActionState,
          useOptimistic, use, memo, forwardRef, lazy, startTransition, act, version,
          __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
          __SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        } = R;
      `,
      loader: "js",
    }));
  },
};

async function compileProtectedChunks(ast: ProgramNode, chunksDir: string) {
  console.log(
    `📦 Compilando módulos protegidos em 'server/protected-chunks/'...`,
  );

  for (const route of ast.routes) {
    if (route.isPublic || !route.chunkName) continue;

    const moduleName = routeModuleName(route.path);

    const sourceModulePath = path.resolve(
      process.cwd(),
      `src/modules/${moduleName}.tsx`,
    );
    const targetJsPath = path.join(chunksDir, `${route.chunkName}.js`);

    if (!fs.existsSync(sourceModulePath)) {
      throw new Error(`Módulo protegido não encontrado: ${sourceModulePath}`);
    }

    await build({
      entryPoints: [sourceModulePath],
      bundle: true,
      outfile: targetJsPath,
      format: "esm",
      jsx: "transform",
      jsxFactory: "window.React.createElement",
      jsxFragment: "window.React.Fragment",
      plugins: [reactGlobalPlugin],
      target: "es2020",
      external: ["react-dom", "react-router-dom", "@policyforges/react"],
    });

    console.log(`  ✅ Chunk gerado: ${route.chunkName}.js`);
  }
}

function generateServerFile(ast: ProgramNode, serverDir: string) {
  console.log(`🚀 Gerando artefatos do servidor em '${serverDir}'...`);
  const serverGenerator = new ServerGenerator(ast);

  // 1. Gera o arquivo de código index.js
  const serverCode = serverGenerator.generateServerCode();
  const serverFilePath = path.join(serverDir, "index.js");
  fs.writeFileSync(serverFilePath, serverCode, "utf-8");
  console.log(`  ✅ Servidor gerado em: ${serverFilePath}`);

  // 2. Gera o package.json de dependências
  const packageJsonContent = serverGenerator.generatePackageJson();
  const packageJsonPath = path.join(serverDir, "package.json");
  fs.writeFileSync(packageJsonPath, packageJsonContent, "utf-8");
  console.log(`  ✅ Manifest gerado em: ${packageJsonPath}`);
}

export async function secureBuildCommand(options: SecureBuildOptions = {}) {
  const { dslFile = "security.auth", serverDir = "server" } = options;

  const dslPath = path.resolve(process.cwd(), dslFile);
  const targetServerDir = path.resolve(process.cwd(), serverDir);
  const chunksDir = path.join(targetServerDir, "protected-chunks");

  if (!fs.existsSync(dslPath)) {
    console.error(`❌ Erro: Arquivo de políticas '${dslFile}' não encontrado.`);
    process.exit(1);
  }

  fs.mkdirSync(chunksDir, { recursive: true });

  try {
    const policyAst = loadValidatedPolicy(dslFile);

    await compileProtectedChunks(policyAst, chunksDir);
    generateServerFile(policyAst, targetServerDir);

    console.log(`✨ Processo concluído com sucesso!`);
  } catch (err: any) {
    console.error(`❌ Falha no build: ${err.message}`);
    process.exit(1);
  }
}
