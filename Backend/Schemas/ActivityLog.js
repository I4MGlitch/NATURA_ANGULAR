const mongoose = require('mongoose');

const activitylogSchema = mongoose.Schema({
    username: { type: String },
    date: {type: Date, default: Date.now},
    transportationModes: { type: String },
    energyUsage: { type: String },
    meals: { type: String },
    transportationEmission: { type: Number},
    energyEmission: { type: Number},
    mealsEmission: { type: Number},
    totalEmission: { type: Number},
});

module.exports = mongoose.model('activitylog', activitylogSchema);