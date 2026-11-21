const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const buildDir = path.resolve(__dirname, "../packages/cli/templates/build");
const source = fs.readFileSync(
  path.resolve(__dirname, "../packages/cli/src/commands/secureBuild.ts"),
  "utf8",
);

test("secure chunks remap React and both JSX runtimes to editable ESM templates", () => {
  for (const template of [
    "react-global.mjs",
    "react-jsx-runtime.mjs",
    "react-jsx-dev-runtime.mjs",
  ]) {
    assert.equal(fs.existsSync(path.join(buildDir, template)), true, template);
  }
  assert.match(source, /react\/jsx-runtime/);
  assert.match(source, /react\/jsx-dev-runtime/);
  assert.match(source, /namespace: "react-global"/);
  assert.match(source, /readTemplate\("build", template\)/);

  for (const name of ["react-jsx-runtime.mjs", "react-jsx-dev-runtime.mjs"]) {
    const file = fs.readFileSync(path.join(buildDir, name), "utf8");
    assert.doesNotMatch(
      file,
      /__CLIENT_INTERNALS|__SECRET_INTERNALS|recentlyCreatedOwnerStacks/,
    );
  }
});

test("production and development JSX work with host React, without private internals", async () => {
  const previousWindow = global.window;
  const creates = [];
  global.window = {
    React: {
      Fragment: Symbol.for("react.fragment"),
      createElement(type, props) {
        const element = { type, props };
        creates.push(element);
        return element;
      },
    },
  };
  try {
    const bridge = await import(
      pathToFileURL(path.join(buildDir, "react-global.mjs")).href
    );
    assert.equal(
      bridge.default,
      global.window.React,
      "default React export must be host React by identity",
    );
    const prod = await import(
      pathToFileURL(path.join(buildDir, "react-jsx-runtime.mjs")).href
    );
    const dev = await import(
      pathToFileURL(path.join(buildDir, "react-jsx-dev-runtime.mjs")).href
    );
    assert.equal(prod.Fragment, Symbol.for("react.fragment"));
    assert.equal(dev.Fragment, prod.Fragment);
    assert.deepEqual(prod.jsx("main", { children: "Hello" }), {
      type: "main",
      props: { children: "Hello" },
    });
    assert.deepEqual(prod.jsxs("ul", { children: ["A", "B"] }, "list-key"), {
      type: "ul",
      props: { children: ["A", "B"], key: "list-key" },
    });
    assert.deepEqual(
      dev.jsxDEV("div", { id: "x" }, "dev-key", false, {}, null),
      {
        type: "div",
        props: { id: "x", key: "dev-key" },
      },
    );
    assert.equal(creates.length, 3);
    assert.equal("recentlyCreatedOwnerStacks" in global.window.React, false);
    delete global.window.React;
    assert.throws(() => prod.jsx("div", {}), /window.React is unavailable/);
  } finally {
    if (previousWindow === undefined) delete global.window;
    else global.window = previousWindow;
  }
});

test("SecureBuild esbuild plugin resolves JSX imports to templates, never node_modules/react", async () => {
  // Isolate the actual compiled CLI code and replace unavailable esbuild with a
  // tiny build harness that invokes its real plugin callbacks.
  const Module = require("node:module");
  const fs = require("node:fs");
  const os = require("node:os");
  const originalLoad = Module._load;
  const builtPlugins = [];
  Module._load = function (request, parent, isMain) {
    if (request === "esbuild")
      return {
        build: async ({ plugins, entryPoints, outfile }) => {
          for (const plugin of plugins) {
            const resolveHandlers = [];
            const loadHandlers = [];
            plugin.setup({
              onResolve: (opts, handler) =>
                resolveHandlers.push({ opts, handler }),
              onLoad: (opts, handler) => loadHandlers.push({ opts, handler }),
            });
            builtPlugins.push({ resolveHandlers, loadHandlers });
          }
          fs.writeFileSync(
            outfile,
            "// mocked esbuild output: see adapter assertions\n",
          );
          assert.match(entryPoints[0], /Dashboard\.tsx$/);
        },
      };
    return originalLoad.call(this, request, parent, isMain);
  };
  const buildModule =
    require.resolve("../packages/cli/dist/commands/secureBuild.js");
  delete require.cache[buildModule];
  let secureBuildCommand;
  try {
    ({ secureBuildCommand } = require(buildModule));
  } finally {
    Module._load = originalLoad;
  }
  const cwd = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policyforges-jsx-test-"));
  try {
    process.chdir(dir);
    fs.writeFileSync(
      "security.auth",
      'profile USER;\nroute "/dashboard" PROTECTED BY [USER] CHUNK "dashboard";\n',
    );
    fs.mkdirSync("src/modules", { recursive: true });
    fs.writeFileSync(
      "src/modules/Dashboard.tsx",
      "export default function Dashboard() { return <main>Hi</main>; }",
    );
    await secureBuildCommand();
    assert.equal(builtPlugins.length, 1);
    const plugin = builtPlugins[0];
    const resolve = (specifier, namespace = "file") => {
      const found = plugin.resolveHandlers.find(
        ({ opts }) =>
          opts.filter.test(specifier) &&
          (!opts.namespace || opts.namespace === namespace),
      );
      assert.ok(found, `No virtual resolver for ${specifier}`);
      return found.handler({ path: specifier, namespace });
    };
    const load = (specifier) => {
      const found = plugin.loadHandlers.find(
        ({ opts }) =>
          opts.filter.test(specifier) && opts.namespace === "react-global",
      );
      assert.ok(found, `No virtual loader for ${specifier}`);
      return found.handler({ path: specifier, namespace: "react-global" });
    };
    const cases = [
      ["react", "react-global.mjs"],
      ["react/jsx-runtime", "react-jsx-runtime.mjs"],
      ["react/jsx-dev-runtime", "react-jsx-dev-runtime.mjs"],
    ];
    for (const [specifier, template] of cases) {
      assert.deepEqual(resolve(specifier), {
        path: specifier,
        namespace: "react-global",
      });
      assert.equal(
        load(specifier).contents,
        fs.readFileSync(path.join(buildDir, template), "utf8"),
      );
    }
    assert.deepEqual(resolve("./react-jsx-runtime.mjs", "react-global"), {
      path: "react/jsx-runtime",
      namespace: "react-global",
    });
  } finally {
    process.chdir(cwd);
    fs.rmSync(dir, { recursive: true, force: true });
    delete require.cache[buildModule];
  }
});
