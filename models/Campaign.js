const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    defaultCategory: { type: String, default: 'General' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
