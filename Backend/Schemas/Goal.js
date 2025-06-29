const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
    title: { type: String },   
    description: { type: String },
    tags: { type: String },
    pictures: [
        {
            data: Buffer,
            contentType: String
        }
    ],
    objective: [
        { 
            nameObj: String,            
        }
    ],
    progression: [
        {
            username: String,
            listObj:
                [
                    {                    
                        comObj: String,
                    }
                ],
            percentage: Number,
            repetition: Number, 
        }
    ],
});

module.exports = mongoose.model('goal', goalSchema);