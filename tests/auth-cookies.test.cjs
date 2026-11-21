const test = require('node:test');
const assert = require('node:assert/strict');
const { authCookies } = require('../packages/react/dist/authCookies.js');

test('JWT and roles are stored in session cookies, restored, and cleared', () => {
  const stored = new Map();
  const writes = [];
  const previousDocument = global.document;
  const previousLocation = global.location;
  global.location = { protocol: 'https:' };
  global.document = {
    get cookie() {
      return [...stored].map(([key, value]) => `${key}=${value}`).join('; ');
    },
    set cookie(input) {
      writes.push(input);
      const parts = input.split(';');
      const index = parts[0].indexOf('=');
      const key = parts[0].substring(0, index);
      const value = parts[0].substring(index + 1);
      if (parts.some((part) => part.trim() === 'Max-Age=0')) stored.delete(key);
      else stored.set(key, value);
    },
  };
  try {
    assert.equal(authCookies.getToken(), null);
    authCookies.setSession('header.payload.signature+/=', ['ADMIN', 'USER']);
    assert.equal(authCookies.getToken(), 'header.payload.signature+/=');
    assert.deepEqual(authCookies.getRoles(), ['ADMIN', 'USER']);
    assert.equal(writes.length, 2);
    for (const value of writes) {
      assert.match(value, /SameSite=Strict/);
      assert.match(value, /Path=\//);
      assert.match(value, /; Secure/);
      assert.doesNotMatch(value, /Max-Age=/);
    }
    authCookies.clearSession();
    assert.equal(authCookies.getToken(), null);
    assert.deepEqual(authCookies.getRoles(), []);
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
    if (previousLocation === undefined) delete global.location;
    else global.location = previousLocation;
  }
});
