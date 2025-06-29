const mongoose = require('mongoose');

const educationalcontentSchema = mongoose.Schema({
    title: { type: String },
    description: { type: String },
    category: { type: String, enum: ['article', 'video', 'infographic']},
    url: { type: String },
    tags: { type: String},
    pictures: [
        {
            data: Buffer,
            contentType: String
        }
    ],   
});

module.exports = mongoose.model('educationalcontent', educationalcontentSchema);