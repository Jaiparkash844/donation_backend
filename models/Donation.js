const mongoose = require('mongoose');
// models/Donation.js
const donationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Zakat', 'Sadqah', 'Fitra', 'General'] },
    category: { type: String, enum: ['Food', 'Education', 'Medical', 'Meal'] },
    paymentMethod: { type: String, enum: ['Cash', 'Bank', 'Online', 'Transfer'] },
    status: { type: String, enum: ['Pending', 'Verified', 'Flagged'], default: 'Pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
