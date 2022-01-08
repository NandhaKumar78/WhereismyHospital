const users = require('./users/users.service.js');
const hospital = require('./hospital/hospital.service.js');
const publicUsers = require('./public-users/public-users.service.js');
const deviceDetails = require('./device-details/device-details.service.js');
const googleHospitals = require('./google-hospitals/google-hospitals.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(hospital);
  app.configure(publicUsers);
  app.configure(deviceDetails);
  app.configure(googleHospitals);
};
