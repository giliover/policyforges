const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { initCommand } = require('../packages/cli/dist/commands/init.js');
const { compileCommand } = require('../packages/cli/dist/commands/compile.js');
const { loadValidatedPolicy } = require('../packages/cli/dist/commands/policyCompiler.js');
const { routeModuleName } = require('../packages/cli/dist/generator/routeModuleName.js');

function inTemporaryProject(callback) {
  const cwd = process.cwd();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'policyforges-init-'));
  try {
    process.chdir(tmp);
    callback(tmp);
  } finally {
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

test('init creates DSL, React routes and matching public/protected modules', () => {
  inTemporaryProject((tmp) => {
    initCommand();
    const expected = [
      'security.auth', 'src/routes-rbac/AppRoutes.tsx',
      'src/routes-rbac/authTypes.ts', 'src/modules/Login.tsx',
      'src/modules/Dashboard.tsx', 'src/modules/Admin.tsx',
    ];
    for (const relative of expected) assert.ok(fs.existsSync(path.join(tmp, relative)), relative);
    const appRoutes = fs.readFileSync('src/routes-rbac/AppRoutes.tsx', 'utf8');
    assert.match(appRoutes, /const Login = lazy\(\(\) => import\("\.\.\/modules\/Login"\)\)/);
    assert.match(appRoutes, /chunkName=\{"user-dashboard"\}/);
    assert.doesNotMatch(appRoutes, /createElement\(lazy/);
    assert.match(fs.readFileSync('src/modules/Login.tsx', 'utf8'), /login\(jwt\.trim\(\), \[\]\)/);
    assert.doesNotMatch(fs.readFileSync('src/modules/Admin.tsx', 'utf8'), /from ['"]@policyforges/);
  });
});

test('init uses existing security.auth, preserves existing files, and adds missing screens', () => {
  inTemporaryProject(() => {
    fs.writeFileSync('security.auth', `profile ADMIN;\nroute "/sign-in" PUBLIC;\nroute "/projects/list" PROTECTED BY [ADMIN] CHUNK "projects";\n`);
    fs.mkdirSync('src/modules', { recursive: true });
    fs.writeFileSync('src/modules/SignIn.tsx', '// my custom screen');
    initCommand();
    assert.equal(fs.readFileSync('src/modules/SignIn.tsx', 'utf8'), '// my custom screen');
    assert.ok(fs.existsSync('src/modules/ProjectsList.tsx'));
    const generated = fs.readFileSync('src/routes-rbac/AppRoutes.tsx', 'utf8');
    assert.match(generated, /chunkName=\{"projects"\}/);
    fs.appendFileSync('security.auth', 'route "/settings" PUBLIC;\n');
    initCommand();
    assert.ok(fs.existsSync('src/modules/Settings.tsx'));
    assert.doesNotMatch(fs.readFileSync('src/routes-rbac/AppRoutes.tsx', 'utf8'), /modules\/Settings/);
    compileCommand('security.auth', 'src/routes-rbac');
    assert.match(fs.readFileSync('src/routes-rbac/AppRoutes.tsx', 'utf8'), /modules\/Settings/);
  });
});

test('route naming follows compiler/build naming and rejects collisions', () => {
  assert.equal(routeModuleName('/'), 'Home');
  assert.equal(routeModuleName('/account/settings'), 'AccountSettings');
  assert.equal(routeModuleName('/users/:id'), 'UsersId');
  inTemporaryProject(() => {
    fs.writeFileSync('security.auth', `route "/foo-bar" PUBLIC;\nroute "/foo_bar" PUBLIC;\n`);
    assert.throws(() => loadValidatedPolicy('security.auth'), /mesmo módulo 'FooBar.tsx'/);
  });
});
