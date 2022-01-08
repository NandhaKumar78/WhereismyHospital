const axios = require('axios')
const { triggerNotification } = require('../../notify')
const NodeGeocoder = require('node-geocoder');
const moment = require('moment');
const options = {
  provider: 'google',
  apiKey: '**********************',
  formatter: null
};
const geocoder = NodeGeocoder(options)

const setImage = async (context) => {
  context.data._id = context.result._id;
  //await context.app.use("/uploadphoto").create(context.data, context.params)
  return context
}

//set location Id for specific location and address
const setLocationIdAddress = async(context) => {
  if (context.data.location && context.data.location.lag && context.data.location.lat) {
    context.data.locationId = context.data.location.lag + "searchHospitalwithlatlag" + context.data.location.lat;
  //const res = await geocoder.reverse({ lat: context.data.location.lat, lon: context.data.location.lag });
  //context.data.address = res[0].formattedAddress;
    context.data.date = moment(new Date).format('MM/DD/YYYY');
  }
} 

/**
 * update hospital id details in public users record
 * @param {*} context contains listofhospitals and id of patient
 */
const updatePublicUsers = async(context) => {
  let hospitals = [];
  if (context.params.listofHospital.length) {
    await context.params.listofHospital.map(async(hospital) => {
      hospitals.push(hospital._id)
    })
  }
  await context.app.service('public-users')._patch(
    context.result._id,
    {"hospitals":hospitals},
    context.params
  )
}



//get devicetokens for sending notifications.
const getTokens = async(context) => {
  context.deviceTokens = [];
  if (context.params.listofHospital.length) {
    await Promise.all(context.params.listofHospital.map(async hospital => {
      let deviceDetails = await context.app.service('device-details').find({
        query : {
          hospitalId: hospital._id
        },
        paginate :false
      })
      if (deviceDetails.length != 0) {
        context.deviceTokens.push(deviceDetails)
      }
    })
    );
    return context;
  }
}

//get list of all hospitals and check isExists in our db or not and return
const getHospitals = async(lat, lag, context) => {
  let latMaximum = Number(lat) + 1.000000;
  let latMinimum = Number(lat) - 1.000000;
  let lonMaximum = Number(lag) + 1.000000;
  let lonMinimum = Number(lag) - 1.000000;

  let hospitals = await context.app.service('google-hospitals').find({
   query: {
      latitute: {
        $gte: Number(latMinimum),
        $lte: Number(latMaximum)
      },
      longitude: {
        $gte: Number(lonMinimum),
        $lte: Number(lonMaximum)
      }
    }, 
    paginate:false
  });
  context.params.listofHospital = [];
  console.log("hiiiiiiiiiiiiiiiiiiii", hospitals.length)
  await Promise.all(hospitals.map(async (hospital) => {
    if (!context.params.checkedHospitals.includes(hospital.name)) {
      let data = await context.app.service('/hospital').find({
        query: {
          name: hospital.name
        }
      })
      if (data.data.length > 0) {
        context.params.listofHospital.push(data.data[0]);
      }
      context.params.checkedHospitals.push(hospital.name);
    }
  }))
  console.log("length", context.params.listofHospital.length)
 /*  if (context.params.listofHospital.length < 5) {
    context.radius =  context.radius + 0.500000
    await getHospitals(updatedLat, updatedLag, context)
  } */
  if (context.params.listofHospital.length >= 3) {
    console.log("in ifffffffffffffffffffff")
    context.params.doneNotification = true;
    await getTokens(context);
    await triggerNotification(context);
    await updatePublicUsers(context);
  }
  return context;
}


//get list of all hospitals and check isExists in our db or not and return using googleAPI
const getHospitalsUsingGoogleApi = async(lat, lag, context) => {
  let Url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" 
    + "location=" + lat +"," + lag + "&radius="+ context.params.radius 
    + "&type=hospital&key=******************"
  axios.get(Url)
    .then(  async(response) => {
      response.data.results.map(async(hospital) => {
        if (!context.params.checkedHospitals.includes(hospital.name)) {
          let data = await context.app.service('/hospital').find({
            query: {
              name: hospital.name
            }
          })
          if (data.data.length > 0) {
            context.params.listofHospital.push(data.data[0]);
          }
          context.params.checkedHospitals.push(hospital.name);
        }
      })
      if (context.params.listofHospital.length < 3) {
        context.params.radius = context.params.radius + 300;
        await getHospitals(lat, lag, context)
      }
      if (context.params.listofHospital.length >= 3) {
        context.params.doneNotification = true;
        await getTokens(context);
        await triggerNotification(context);
        await updatePublicUsers(context);
      }
      return context;
    })
    .catch(function (error) {
      console.log(error);
    })
}

//modify result data and return result
const sendResultData = async(context) => {
  context.result.Status ="sucess" 
  return context
}

//Search nera by hospitals and send notifications
const searchHospitals = async(context) => {
  context.params.listofHospital = [];
  context.params.doneNotification = false;
  context.radius = 1;
  let lat =  Number(context.data.location.lat)
  let lag = Number(context.data.location.lag)
  context.params.checkedHospitals = [];
  await getHospitals(lat, lag, context); 
  setTimeout(async () => {
    if (context.params && !context.params.doneNotification) {
      await getTokens(context);
      await triggerNotification(context);
      await updatePublicUsers(context);
    }
  }, 30000);
}
 
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setLocationIdAddress 
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      sendResultData,
      async (context) => {
        setTimeout(async () => {
          await searchHospitals(context);
        }, 1000);
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
