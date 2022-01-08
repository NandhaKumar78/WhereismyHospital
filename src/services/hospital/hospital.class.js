const { Service } = require('feathers-mongoose');

exports.Hospital = class Hospital extends Service {
  setup(app) {
    this.app = app;
  }
  
  async create(data, params) {
    try {
      let result = await super.create(data, params);
      let userData = {
        "email": data.email,
        "password": "@Admin123",
        "hospitalId": result._id,
        "hospitalName": data.name
      }
      return this.app.service('users').create(userData, params)
    } catch (err) {
      console.log("error", err)
    }
  } 
};
