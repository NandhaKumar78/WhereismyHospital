// Hospital-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'hospital';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true },
    specialityType : { type: String, required: true },
    pinCode: { type: String, required: true },
    is_deleted: {
      type: 'boolean',
      default: false,
    },
    patientIds : {
      type:Array,
      default:[]
    },
    location :{
      type: Object, required: true 
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
