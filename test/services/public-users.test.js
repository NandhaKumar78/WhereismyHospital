const assert = require('assert');
const app = require('../../src/app');

describe('\'PublicUsers\' service', () => {
  it('registered the service', () => {
    const service = app.service('public-users');

    assert.ok(service, 'Registered the service');
  });
});
