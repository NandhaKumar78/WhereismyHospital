var cron = require('node-cron');
let app = require('../app')
const { triggerNotification } = require('../notify');


cron.schedule('*/5 * * * *', async() => {
  
  /**
   * get all device tokens of hospital to send Notification
   * @param {*} hospitals Hospitals DEtails
   * @returns all available deviceDEtails 
   */
  const getTokens = async(hospitals) => {
    deviceTokens = [];
    if (hospitals.length) {
      await Promise.all(hospitals.map(async hospital => {
        let deviceDetails = await app.service('device-details').find({
          query : {
            hospitalId: hospital
          },
          paginate :false
        })
        if (deviceDetails.length != 0) {
          deviceTokens.push(deviceDetails)
        }
      }));
      return deviceTokens;
    }
  }
  
  let usersList = await app.service('public-users').find({
    query: {
      isAdmitted: false
    },
    paginate:false
  });

  if (usersList.length) {
    usersList.map( async(user) => {
      if (user.hospitals.length) {
        let tokens = await getTokens(user.hospitals);
        let context = {
          result: {
            id: user._id,
            address:user.address
          },
          deviceTokens : tokens
        }
        await triggerNotification(context);
      }
    })
  }

});