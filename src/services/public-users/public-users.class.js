const { Service } = require('feathers-mongoose');

exports.PublicUsers = class PublicUsers extends Service {
  setup(app) {
    this.app = app;
  }
      
  async create(data, params) {
    try {
        if (data.locationId) {
          params.query = {
            "locationId" : data.locationId
          }
          let result = await super.find(params)
          if (result.data.length) {
            await result.data.map( async user => {
              if(!user.isAdmitted) {
                return user;
              }
            }) 
          }
          return await super.create(data, params);
        }
    } catch (err) {
      console.log("error", err)
    }
  } 
};
