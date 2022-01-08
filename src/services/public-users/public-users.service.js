// Initializes the `PublicUsers` service on path `/public-users`
const { PublicUsers } = require('./public-users.class');
const createModel = require('../../models/public-users.model');
const hooks = require('./public-users.hooks');
const mongoose = require('mongoose');

let aws = require('aws-sdk')
let multer = require('multer')
let multerS3 = require('multer-s3')

const s3Config = new aws.S3({
  accessKeyId: 'AKIAVN7BKOKTRPSY5VMV',
  secretAccessKey: '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',
  Bucket: 'where-is-my-hospital'
});

let upload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: 'where-is-my-hospital',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, "Image-" + file.length + Date.now().toString())
    }
  })
})


module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/public-users', new PublicUsers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('public-users');

  service.hooks(hooks);

  //get listod userIds and make into query type array
  const constructQueryData = async(data) => {
    let queryArray = [];
    await data.userIdList.map(async user => {
      queryArray.push(mongoose.Types.ObjectId(user));
    })
    return queryArray
  }

  // get list of publice users data and return 
  app.use('/public-users-list', {
    async create(data, params) {
      let queryArray = await constructQueryData(data);
      return await options.Model.find({
        '_id': { $in: queryArray}
      })
    }
  })
  
  /**
   * ACk the patient with hospital id
   * @id hospital id to ACk
   * @data contains patients count id ACk and Patient id
   * @return status of ACk with count
   */
  app.use('/acknowledge-hospital', {
    async update(id, data, params) {
      let user = await service.get(data._id, params);
      let hospital = await app.service('hospital').get(id, params);
      if (user.acknowledgedPatientCount == user.noOfPatients) {
        return {
          "message":"Already Acknowledged by other Hospitals"
        }
      }
      let balancePatientCount = (Number(user.noOfPatients) - Number(user.acknowledgedPatientCount));
      let patients = balancePatientCount - Number(data.noOfPatients);
      let result;
      if (patients >= 0) {
        result = {
          id : id,
          name: hospital.name,
          noOfPatients : data.noOfPatients
        }
        user.acknowledgedPatientCount =  Number(user.acknowledgedPatientCount) + Number(data.noOfPatients);
      } else {
        result = {
          id : id,
          name: hospital.name,
          noOfPatients : balancePatientCount
        }
        user.acknowledgedPatientCount =  Number(user.acknowledgedPatientCount) + Number(balancePatientCount);
      }
      user.acknowledgeHospital.push(result);
      if (user.acknowledgedPatientCount == user.noOfPatients) {
        user.isAdmitted = true;
        user.isAcknowledge = true;
      }
      await service.patch(data._id, user, params) 
      let list =  hospital.patientIds;
      list.push(data._id)

      hospital.patientIds = list

      await app.service('hospital')._patch(id, hospital, params);
      return {
        "message":"Acknowledged Sucessfully!",
        result
      }
    }
  })

};
