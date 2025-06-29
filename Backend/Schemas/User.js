const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String },
    profilePic: [
        {
            data: Buffer,
            contentType: String
        }
    ],
    password: { type: String },
    phone: { type: String},
    email: { type: String},
    bio: {type: String},
    commutingMethods: { type: String },
    energySources: { type: String },
    dietaryPreferences: { type: String },    
    preferredReminder: { type: String },
    friendList: [
        {
            username: String,            
        }
    ],
});

module.exports = mongoose.model('user', userSchema);