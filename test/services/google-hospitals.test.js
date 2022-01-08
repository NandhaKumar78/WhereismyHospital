const assert = require('assert');
const app = require('../../src/app');

describe('\'googleHospitals\' service', () => {
  it('registered the service', () => {
    const service = app.service('google-hospitals');

    assert.ok(service, 'Registered the service');
  });
});
