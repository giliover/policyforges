const fs = require('node:fs');
const root = require('../package.json');
for (const name of ['cli', 'react']) {
  const pkg = require(`../packages/${name}/package.json`);
  if (pkg.version !== root.version) throw new Error(`${name}: ${pkg.version} != ${root.version}`);
  for (const entry of [pkg.main, pkg.types, ...(pkg.bin ? Object.values(pkg.bin) : [])]) {
    if (!fs.existsSync(`packages/${name}/${entry}`)) throw new Error(`Missing ${name}/${entry}`);
  }
}
console.log('Package versions and entrypoints verified.');
