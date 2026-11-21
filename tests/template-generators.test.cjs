const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
// Prefer the project's TypeScript; fall back to the global CLI for isolated CI runs.
let ts;
try {
  ts = require("typescript");
} catch {
  const { execFileSync } = require("node:child_process");
  const globalModules = execFileSync("npm", ["root", "-g"], {
    encoding: "utf8",
  }).trim();
  ts = require(path.join(globalModules, "typescript"));
}

const {
  CodeGenerator,
} = require("../packages/cli/dist/generator/generator.js");
const {
  ServerGenerator,
} = require("../packages/cli/dist/generator/serverGenerator.js");
const {
  readTemplate,
} = require("../packages/cli/dist/generator/templateReader.js");
const {
  loadValidatedPolicy,
} = require("../packages/cli/dist/commands/policyCompiler.js");
const {
  scaffoldRouteModule,
} = require("../packages/cli/dist/generator/moduleScaffold.js");

const cliDir = path.join(__dirname, "..", "packages", "cli");
const templatesDir = path.join(cliDir, "templates");

// Parse native source files with TypeScript's syntax parser (without needing type dependencies).
function assertValidTsx(filename, contents) {
  const ast = ts.createSourceFile(
    filename,
    contents,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  assert.deepEqual(
    ast.parseDiagnostics.map((error) => error.messageText),
    [],
    filename,
  );
}

test("all source templates are kept in their native extensions and parse correctly", () => {
  const expected = [
    "security.auth",
    "react/routes-rbac/AppRoutes.tsx",
    "react/routes-rbac/authTypes.ts",
    "react/modules/Login.tsx",
    "react/modules/Public.tsx",
    "react/modules/Protected.tsx",
    "react/modules/ExampleScreen.tsx",
    "build/react-global.mjs",
    "build/react-jsx-runtime.mjs",
    "build/react-jsx-dev-runtime.mjs",
    "server/index.js",
    "server/package.json",
  ];
  for (const name of expected) {
    const fullPath = path.join(templatesDir, name);
    assert.ok(fs.existsSync(fullPath), `Template missing: ${name}`);
    if (name.endsWith(".tsx") || name.endsWith(".ts"))
      assertValidTsx(name, fs.readFileSync(fullPath, "utf8"));
    if (name.endsWith(".json")) JSON.parse(fs.readFileSync(fullPath, "utf8"));
  }
  const cliPkg = require("../packages/cli/package.json");
  assert.ok(
    cliPkg.files.includes("templates/"),
    "npm pack must include templates",
  );
});

test("CodeGenerator uses native JSX template and preserves DSL route ordering", () => {
  const ast = {
    profiles: [{ name: "USER" }, { name: "ADMIN" }],
    routes: [
      { path: "/start", isPublic: true },
      {
        path: "/inner",
        isPublic: false,
        chunkName: "inner",
        allowedRoles: ["ADMIN"],
      },
      { path: "/support", isPublic: true },
    ],
  };
  const generator = new CodeGenerator(ast, "../../screens");
  const result = generator.generate();
  assert.match(result.appRoutesCode, /import\("\.\.\/\.\.\/screens\/Start"\)/);
  assert.match(
    result.appRoutesCode,
    /import\("\.\.\/\.\.\/screens\/Support"\)/,
  );
  assert.ok(
    result.appRoutesCode.indexOf('path="/start"') <
      result.appRoutesCode.indexOf('path="/inner"'),
  );
  assert.ok(
    result.appRoutesCode.indexOf('path="/inner"') <
      result.appRoutesCode.indexOf('path="/support"'),
  );
  assert.match(result.appRoutesCode, /chunkName=\{"inner"\}/);
  assert.match(result.authTypesCode, /"PUBLIC" \| "USER" \| "ADMIN"/);
  assert.doesNotMatch(
    result.appRoutesCode,
    /@policyforges:|ExampleScreen|public-example|protected-example/,
  );
  assertValidTsx("AppRoutes.tsx", result.appRoutesCode);
});

test("ModuleScaffold renders editable TSX sources without leftover markers", () => {
  const publicModule = scaffoldRouteModule({ path: "/help", isPublic: true });
  const protectedModule = scaffoldRouteModule({
    path: "/reports",
    isPublic: false,
  });
  const login = scaffoldRouteModule(
    { path: "/login", isPublic: true },
    "/reports",
  );
  assert.match(publicModule, /function Help\(\)/);
  assert.match(protectedModule, /function Reports\(\)/);
  assert.match(login, /navigate\("\/reports"\)/);
  for (const [filename, content] of [
    ["Help.tsx", publicModule],
    ["Reports.tsx", protectedModule],
    ["Login.tsx", login],
  ]) {
    assertValidTsx(filename, content);
    assert.doesNotMatch(content, /ExampleScreen|@policyforges:/);
  }
});

test("ServerGenerator reads real JS and JSON sources, emits policies as data", () => {
  const ast = {
    profiles: [{ name: "USER" }],
    routes: [
      { path: "/login", isPublic: true },
      {
        path: "/reports",
        isPublic: false,
        chunkName: "reports-2026",
        allowedRoles: ["USER"],
      },
    ],
  };
  const gen = new ServerGenerator(ast);
  assert.equal(gen.generateServerCode(), readTemplate("server", "index.js"));
  assert.equal(
    gen.generatePackageJson(),
    readTemplate("server", "package.json"),
  );
  assert.deepEqual(JSON.parse(gen.generatePermissions()), {
    "reports-2026": ["USER"],
  });
  assert.match(
    gen.generateServerCode(),
    /require\('\.\/chunk-permissions.json'\)/,
  );
  assert.doesNotMatch(gen.generateServerCode(), /reports-2026|@policyforges:/);
});

test("Unsafe chunk names are rejected by policy analysis", () => {
  const originalDir = process.cwd();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pf-unsafe-"));
  try {
    process.chdir(tmp);
    fs.writeFileSync(
      "security.auth",
      'profile ADMIN;\nroute "/x" PROTECTED BY [ADMIN] CHUNK "../escape";\n',
    );
    assert.throws(
      () => loadValidatedPolicy("security.auth"),
      /nome de chunk.*deve conter apenas/,
    );
  } finally {
    process.chdir(originalDir);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
