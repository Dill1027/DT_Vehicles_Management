const { test } = require('node:test');
const assert = require('node:assert/strict');
const { allowRoles, trustedMutationOrigin, requireAuth } = require('../middleware/auth');
function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
test('only admins can archive/delete/manage users; editors can add/edit; viewers cannot mutate', () => {
  for (const role of ['admin', 'editor', 'viewer']) {
    let allowed = false; const res = response();
    allowRoles('admin')({ user: { role } }, res, () => { allowed = true; });
    assert.equal(allowed, role === 'admin');
    let editing = false;
    allowRoles('admin', 'editor')({ user: { role } }, response(), () => { editing = true; });
    assert.equal(editing, role !== 'viewer');
  }
});
test('an unauthenticated request is rejected without reaching a route', async () => {
  const res = response();
  await requireAuth({ headers: {} }, res, () => assert.fail('must require a session'));
  assert.equal(res.code, 401);
});
test('cross-site writes are rejected while local same-site writes are accepted', () => {
  const res = response();
  trustedMutationOrigin({ method: 'POST', headers: { origin: 'https://untrusted.example' } }, res, () => assert.fail('must reject origin'));
  assert.equal(res.code, 403);
  let allowed = false;
  trustedMutationOrigin({ method: 'PATCH', headers: { origin: 'http://localhost:3000' } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});
