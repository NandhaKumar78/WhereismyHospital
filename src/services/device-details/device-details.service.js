// Initializes the `deviceDetails` service on path `/device-details`
const { DeviceDetails } = require('./device-details.class');
const createModel = require('../../models/device-details.model');
const hooks = require('./device-details.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/device-details', new DeviceDetails(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('device-details');

  service.hooks(hooks);
};
