#!/usr/bin/env node

import { Command } from "commander";
import { validateCommand } from "./commands/validate.js";
import { compileCommand } from "./commands/compile.js";
import { initCommand } from "./commands/init.js";
import { secureBuildCommand } from "./commands/secureBuild.js";
import { startServerCommand } from "./commands/startServer.js";
import { installServerCommand } from "./commands/installServer.js";

const program = new Command();

program
  .name("policyforges")
  .description("PolicyForges — compilador de políticas RBAC e entrega autorizada de módulos")
  .version("1.0.2");

program
  .command("init")
  .description("Cria um arquivo de modelo security.auth no diretório atual")
  .option(
    "-f, --filename <filename>",
    "Nome do arquivo de saída",
    "security.auth",
  )
  .action((options) => {
    initCommand(options.filename);
  });

program
  .command("compile")
  .description("Compila o arquivo de DSL (.auth) em componentes React")
  .option("-i, --input <path>", "Arquivo de entrada com a DSL", "security.auth")
  .option(
    "-o, --output <dir>",
    "Diretório de saída para os arquivos gerados",
    "src/routes-rbac",
  )
  .action((options) => {
    compileCommand(options.input, options.output);
  });

program
  .command("build")
  .alias("secure-build")
  .description(
    "Compila os módulos protegidos e gera o servidor em server/index.js",
  )
  .option("-d, --dsl <path>", "Caminho do arquivo DSL", "security.auth")
  .option("-o, --out <dir>", "Diretório de saída do servidor", "server")
  .action(async (options) => {
    await secureBuildCommand({
      dslFile: options.dsl,
      serverDir: options.out,
    });
  });

program
  .command("start")
  .description("Inicia o servidor RBAC gerado no build")
  .option("-o, --out <dir>", "Diretório do servidor", "server")
  .action((options) => {
    startServerCommand({
      serverDir: options.out,
    });
  });

program
  .command("install")
  .description(
    "Instala as dependências (npm install) na pasta do servidor gerado",
  )
  .option("-o, --out <dir>", "Diretório do servidor", "server")
  .action((options) => {
    installServerCommand({
      serverDir: options.out,
    });
  });
program
  .command("validate")
  .alias("check")
  .description("Valida a sintaxe e as políticas do security.auth sem gerar arquivos")
  .option("-i, --input <path>", "Arquivo DSL", "security.auth")
  .action((options) => validateCommand(options.input));

program.parse(process.argv);
