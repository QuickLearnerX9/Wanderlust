const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import passport-local-mongoose
const passportLocalMongooseModule = require('passport-local-mongoose');

// Bulletproof extraction: handles both direct function exports and object wrappers (.default)
const passportLocalMongoose = typeof passportLocalMongooseModule === 'function' 
  ? passportLocalMongooseModule 
  : passportLocalMongooseModule.default;

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Pass the guaranteed function into the plugin
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);