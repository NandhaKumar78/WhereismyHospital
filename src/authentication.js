const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/login', authentication);
  app.configure(expressOauth());

  /**
   * create new device details after login with device token
   * to store firebase token
   * @param {*} context 
   * @returns  context
   */
  const addDeviceDetails = async(context) => {
    let deviceTokens =  await app.service('device-details').find({
      query : {
        "deviceToken":context.data.deviceToken
      }
    })

    let hospitals = await app.service('hospital').find({
      query : {
        "email": context.data.email
      }
    })

    if (hospitals.data.length) {
      if (deviceTokens.data.length) {
        context.result = {
          "accessToken":context.result.accessToken,
          "hospitalName":hospitals.data[0].name,
          "hospitalId":hospitals.data[0]._id
        }
        return context 
      }
      let data = {
        "hospitalId":hospitals.data[0]._id,
        "deviceToken":context.data.deviceToken
      }
      await app.service('device-details').create(data);
      context.result = {
        "accessToken":context.result.accessToken,
        "hospitalName":hospitals.data[0].name,
        "hospitalId":hospitals.data[0]._id
      }
      return context
    } else {
      context.result = {
        "messgae":"USER NOT ASSOCIATED WITH ANY HOSPITAL! CONTACT ADMIN TEAM"
      }
    }
  }


  app.service('login').hooks({
    after: {
      all: [],
      find: [],
      get: [],
      create: [addDeviceDetails],
      update: [],
      patch: [],
      remove: []
    }
  });
  
};
