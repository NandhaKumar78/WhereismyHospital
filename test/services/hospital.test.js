const assert = require('assert');
const app = require('../../src/app');

describe('\'Hospital\' service', () => {
  it('registered the service', () => {
    const service = app.service('hospital');

    assert.ok(service, 'Registered the service');
  });
});
