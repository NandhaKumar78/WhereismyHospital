// Initializes the `googleHospitals` service on path `/google-hospitals`
const { GoogleHospitals } = require('./google-hospitals.class');
const createModel = require('../../models/google-hospitals.model');
const hooks = require('./google-hospitals.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/google-hospitals', new GoogleHospitals(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('google-hospitals');

  service.hooks(hooks);
};
