const assert = require('assert');
const app = require('../../src/app');

describe('\'deviceDetails\' service', () => {
  it('registered the service', () => {
    const service = app.service('device-details');

    assert.ok(service, 'Registered the service');
  });
});
