// PublicUsers-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'publicUsers';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true },
    mobileNumber: { type: Number},
    location: { type: Object, required: true },
    landmark: { type: String,  required: true },
    noOfPatients : { type: Number, default:0 },
    hospitals : {type:Array, default:[]},
    acknowledgedPatientCount : {type :Number, default: 0}, 
    additionalDetails: { type: String },
    image: {
      type: Object
  },
    isAcknowledge:{ type: 'boolean',
    default: false },
    acknowledgeHospital:{
      type:Array,
      default:[] 
    },
    date:{
      type: String
    },
    locationId: { type: String },
    address: { type: String }, 
    is_deleted: {
      type: 'boolean',
      default: false
    },
    admiitedHospitalId : {
      type: String 
    },
    isAdmitted: {
      type: 'boolean',
      default: false
    },
    isProcessed: {
      type: 'boolean',
      default: false
    }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};
