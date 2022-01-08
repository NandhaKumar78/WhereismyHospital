let admin = require("firebase-admin");
let serviceAccount = require("../firebase-config.json");
//const app =require('./app')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://wmh-app-cac19-default-rtdb.asia-southeast1.firebasedatabase.app"
});

/**
 * send notification to front-end using firebase
 * @param {*} context contains details to send notification
 */
const triggerNotification = async(context) => {
  context.deviceTokens.map(devices => {
    devices.map(device => {
      let data = {
        notification:{ 
          "title":"EMERGENCY", 
          "body":"You have a new Accident Reported in Near by Location"
        },
        data: {
          patientID: 'JSON.stringify(context.result._id)',
          address: 'JSON.stringify(context.result.address)'
        }
      }
  admin.messaging().sendToDevice(device.deviceToken, data)
    .then( response => {
      console.log('Push Notification sent successfully', response, data.notification, response.results[0].error);
    })
    .catch( error => {
      console.log("Error", error);
    });
  })
})
}


module.exports.triggerNotification = triggerNotification;