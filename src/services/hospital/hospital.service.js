// Initializes the `Hospital` service on path `/hospital`
const { Hospital } = require('./hospital.class');
const createModel = require('../../models/hospital.model');
const hooks = require('./hospital.hooks');
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',
  apiKey: '*************************',
  formatter: null
};
const geocoder = NodeGeocoder(options)


module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/hospital', new Hospital(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('hospital');

  service.hooks(hooks);
  
  /**
   * get all nearby accident and return patient details
   * @id hospital ID to check nearby accident
   * @return Array contains all nearby patient details
   */
  app.use('/getNearByAccidentLists', {
    async get(id) {
      let data = await service.get(id);
      if (data.address) {
        let usersList = await app.service('public-users').find({
          query: {
            isAdmitted: false,
            _id :{ 
              $nin : data.patientIds
              },
          },
          paginate:false
        });
        
        if (data.location && data.location.lat &&  data.location.lon) {
          let lat = Number(data.location.lat).toFixed(6);
          let lon =  Number(data.location.lon).toFixed(6);
          let patientList = await usersList.filter(value => {
            if (value.location.lat > (Number(lat) - 1.00000) && value.location.lat < (Number(lat) + 1.000000)
              && value.location.lag > (Number(lon) - 1.00000) && value.location.lag < Number(lon) + 1.500000) {
              return value
            }
          }) 
          return patientList.sort(function(x, y) {
            return y.createdAt - x.createdAt;
          })
        } else {
          return {
            "message":"Hospital Location Not Found"
          }
        } 
      }
    }
  })

  /**
   * get All ACk patient LIst and retrurn
   * @id HOspital Id to get details
   * @return Array Contains ACk patients details
   */
  app.use('/getAckPAtientsList', {
    async get(id) {
      let data = await service.get(id);
      if (data.patientIds.length) {
        return app.service('/public-users-list').create({
          userIdList:data.patientIds
        }, {})
      } else {
        return []
      }
    }
  })

};
